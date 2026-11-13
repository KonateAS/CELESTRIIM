import "dotenv/config";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import bcrypt from "bcryptjs";
import { ContactStatus, Prisma, PrismaClient, PublicationStatus } from "@prisma/client";
import sharp from "sharp";
import {
  renderAbout,
  renderAdminContentEditor,
  renderAdminContentIndex,
  renderAdminDashboard,
  renderAdminLogin,
  renderAdminMedia,
  renderAdminMessages,
  renderContact,
  renderExpertiseDetail,
  renderExpertises,
  renderHome,
  renderNotFound,
  renderPartnerships,
  renderPerspectiveDetail,
  renderPerspectives,
  renderProjectDetail,
  renderProjects,
  renderSitePage,
} from "./lib/site.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = await readFile(path.join(ROOT, "public", "site-template.html"), "utf8");
const SITE_DATA_SOURCE = await readFile(path.join(ROOT, "js", "content.js"), "utf8");
const SITE_DATA_CONTEXT = {};
runInNewContext(`${SITE_DATA_SOURCE}\nglobalThis.__siteData = SITE;`, SITE_DATA_CONTEXT, { timeout: 100 });
const STATIC_SITE_DATA = JSON.parse(JSON.stringify(SITE_DATA_CONTEXT.__siteData));
const prisma = new PrismaClient();
const { compare } = bcrypt;
const PORT = Number(process.env.PORT || 3000);
const SESSION_COOKIE = "celestrium_session";
const SESSION_SECONDS = 60 * 60 * 8;
const MAX_CONTACT_BYTES = 12_000;
const MAX_CONTENT_BYTES = 100_000;
const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const loginAttempts = new Map();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function siteLayout(content, { title = "CELESTRIIUM — Conseil, impact, avenir", description = "CELESTRIIUM, agence de conseil et d’activation à impact en Côte d’Ivoire.", status = 200 } = {}) {
  const html = TEMPLATE
    .replace("<!--PAGE_TITLE-->", escapeHtml(title))
    .replace("<!--PAGE_DESCRIPTION-->", escapeHtml(description))
    .replace("<!--SERVER_RENDERED_PAGE-->", content);
  return { status, body: html };
}

function securityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'");
}

function sendHtml(response, page) {
  response.writeHead(page.status || 200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end(page.body);
}

function sendText(response, status, text) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  response.end(text);
}

function redirect(response, location, status = 303, headers = {}) {
  response.writeHead(status, { Location: location, ...headers });
  response.end();
}

function json(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

function readCookie(request, name) {
  const cookieHeader = request.headers.cookie || "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET doit contenir au moins 32 caractères.");
  return secret;
}

function signature(payload) {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

function createSessionToken(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

function verifySessionToken(token) {
  if (!token) return null;
  const [payload, providedSignature, extra] = token.split(".");
  if (!payload || !providedSignature || extra) return null;
  const expected = Buffer.from(signature(payload));
  const provided = Buffer.from(providedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.sub !== "string" || typeof data.exp !== "number" || data.exp <= Date.now() / 1000) return null;
    return data.sub;
  } catch {
    return null;
  }
}

async function getAdminSession(request) {
  const userId = verifySessionToken(readCookie(request, SESSION_COOKIE));
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } });
  return user?.role === "ADMIN" ? user : null;
}

function cookieOptions(token, maxAge = SESSION_SECONDS) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

function isSameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

async function readRequestBody(request, maxBytes) {
  const declaredLength = Number(request.headers["content-length"] || 0);
  if (declaredLength > maxBytes) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 });
  const parts = [];
  let length = 0;
  for await (const part of request) {
    length += part.length;
    if (length > maxBytes) throw Object.assign(new Error("Payload trop volumineux."), { statusCode: 413 });
    parts.push(part);
  }
  return Buffer.concat(parts);
}

async function readForm(request, maxBytes = MAX_CONTENT_BYTES) {
  const bytes = await readRequestBody(request, maxBytes);
  const form = new URLSearchParams(bytes.toString("utf8"));
  return {
    get: (name) => form.get(name) || "",
    getAll: (name) => form.getAll(name),
  };
}

function loginLimit(request) {
  const key = request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.expiresAt < now) {
    loginAttempts.set(key, { count: 0, expiresAt: now + 15 * 60 * 1000 });
  }
  const current = loginAttempts.get(key);
  return { key, allowed: current.count < 8, current };
}

function safeMediaDirectory() {
  return process.env.MEDIA_STORAGE_DIR || path.join(ROOT, "public", "uploads");
}

function detectImage(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

function requireAdmin(response, user) {
  if (user) return false;
  redirect(response, "/admin/login", 303);
  return true;
}

function mimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return ({
    ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".html": "text/html; charset=utf-8",
    ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
    ".mp4": "video/mp4", ".ico": "image/x-icon", ".woff2": "font/woff2",
  })[extension] || "application/octet-stream";
}

async function serveStatic(request, response, pathname) {
  const mounts = [
    ["/css/", path.join(ROOT, "css")], ["/js/", path.join(ROOT, "js")],
    ["/assets/", path.join(ROOT, "assets")], ["/public/illustrations/", path.join(ROOT, "public", "illustrations")],
    ["/brand/", path.join(ROOT, "public", "brand")], ["/illustrations/", path.join(ROOT, "public", "illustrations")],
    ["/media/", path.join(ROOT, "public", "media")],
  ];
  for (const [prefix, baseDirectory] of mounts) {
    if (!pathname.startsWith(prefix)) continue;
    const relative = decodeURIComponent(pathname.slice(prefix.length));
    const filePath = path.resolve(baseDirectory, relative);
    if (!filePath.startsWith(path.resolve(baseDirectory) + path.sep)) return sendText(response, 404, "Not found");
    try {
      const fileInfo = await stat(filePath);
      const cacheControl = prefix === "/css/" || prefix === "/js/" ? "no-cache" : "public, max-age=86400";
      const headers = { "Content-Type": mimeType(filePath), "Cache-Control": cacheControl, "Accept-Ranges": "bytes" };
      if (request.headers.range) {
        const match = request.headers.range.match(/^bytes=(\d*)-(\d*)$/);
        if (!match || (!match[1] && !match[2])) {
          response.writeHead(416, { ...headers, "Content-Range": `bytes */${fileInfo.size}` });
          response.end();
          return true;
        }
        const start = match[1] ? Number(match[1]) : Math.max(0, fileInfo.size - Number(match[2]));
        const end = match[2] ? Number(match[2]) : fileInfo.size - 1;
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || end >= fileInfo.size) {
          response.writeHead(416, { ...headers, "Content-Range": `bytes */${fileInfo.size}` });
          response.end();
          return true;
        }
        response.writeHead(206, { ...headers, "Content-Length": end - start + 1, "Content-Range": `bytes ${start}-${end}/${fileInfo.size}` });
        if (request.method === "HEAD") response.end();
        else createReadStream(filePath, { start, end }).on("error", () => response.destroy()).pipe(response);
        return true;
      }
      response.writeHead(200, { ...headers, "Content-Length": fileInfo.size });
      if (request.method === "HEAD") response.end();
      else createReadStream(filePath).on("error", () => response.destroy()).pipe(response);
    } catch {
      sendText(response, 404, "Not found");
    }
    return true;
  }

  const uploadMatch = pathname.match(/^\/uploads\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp)$/i);
  if (uploadMatch) {
    try {
      const file = await readFile(path.join(safeMediaDirectory(), uploadMatch[1]));
      response.writeHead(200, { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" });
      response.end(request.method === "HEAD" ? undefined : file);
    } catch {
      sendText(response, 404, "Not found");
    }
    return true;
  }
  return false;
}

async function renderPublicPage(pathname, searchParams) {
  if (pathname === "/") return siteLayout(await renderHome(prisma, pathname));
  if (pathname === "/contact") return siteLayout(renderContact(searchParams));
  if (pathname === "/expertises") return siteLayout(await renderExpertises(prisma, pathname));
  if (pathname.startsWith("/expertises/")) {
    const item = await prisma.expertise.findFirst({ where: { slug: decodeURIComponent(pathname.slice("/expertises/".length)), status: PublicationStatus.PUBLISHED } });
    return item ? siteLayout(renderExpertiseDetail(item, pathname), { title: `${item.title} — CELESTRIIUM`, description: item.summary }) : siteLayout(renderNotFound(pathname), { title: "Page introuvable — CELESTRIIUM", status: 404 });
  }
  if (pathname === "/realisations") return siteLayout(await renderProjects(prisma, pathname));
  if (pathname.startsWith("/realisations/")) {
    const slug = decodeURIComponent(pathname.slice("/realisations/".length));
    const item = await prisma.project.findFirst({ where: { slug, status: PublicationStatus.PUBLISHED }, include: { gallery: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } } } });
    if (!item) return siteLayout(renderNotFound(pathname), { title: "Page introuvable — CELESTRIIUM", status: 404 });
    const coverAsset = item.coverImage ? await prisma.mediaAsset.findUnique({ where: { storageKey: item.coverImage }, select: { altText: true } }) : null;
    return siteLayout(renderProjectDetail(item, coverAsset?.altText, pathname), { title: `${item.title} — CELESTRIIUM`, description: item.summary });
  }
  if (pathname === "/perspectives") return siteLayout(await renderPerspectives(prisma, pathname));
  if (pathname.startsWith("/perspectives/")) {
    const item = await prisma.article.findFirst({ where: { slug: decodeURIComponent(pathname.slice("/perspectives/".length)), status: PublicationStatus.PUBLISHED } });
    return item ? siteLayout(renderPerspectiveDetail(item, pathname), { title: `${item.title} — CELESTRIIUM`, description: item.excerpt }) : siteLayout(renderNotFound(pathname), { title: "Page introuvable — CELESTRIIUM", status: 404 });
  }
  if (pathname === "/a-propos" || pathname === "/partenariats") {
    const item = await prisma.page.findFirst({ where: { slug: pathname.slice(1), status: PublicationStatus.PUBLISHED } });
    if (pathname === "/partenariats") return siteLayout(renderPartnerships(item, pathname), { title: item?.seoTitle || "Partenariats — CELESTRIIUM", description: item?.seoDescription || item?.summary });
    return siteLayout(renderAbout(item, pathname), { title: item?.seoTitle || "À propos — CELESTRIIUM", description: item?.seoDescription || item?.summary });
  }
  if (pathname === "/robots.txt") return { status: 200, body: "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n" , contentType: "text/plain; charset=utf-8" };
  if (pathname === "/sitemap.xml") return { status: 200, body: await renderSitemap(prisma), contentType: "application/xml; charset=utf-8" };
  return siteLayout(renderNotFound(pathname), { title: "Page introuvable — CELESTRIIUM", status: 404 });
}

async function renderSitemap(db) {
  const origin = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
  const [expertises, projects, articles, pages] = await Promise.all([
    db.expertise.findMany({ where: { status: PublicationStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
    db.project.findMany({ where: { status: PublicationStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
    db.article.findMany({ where: { status: PublicationStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ where: { status: PublicationStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
  ]);
  const routes = ["/", "/a-propos", "/partenariats", "/expertises", "/realisations", "/perspectives", "/contact", ...expertises.map((item) => `/expertises/${item.slug}`), ...projects.map((item) => `/realisations/${item.slug}`), ...articles.map((item) => `/perspectives/${item.slug}`), ...pages.map((item) => `/${item.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${escapeHtml(origin + route)}</loc></url>`).join("")}</urlset>`;
}

async function adminRouter(request, response, url) {
  const pathname = url.pathname;
  if (pathname === "/admin/login" && request.method === "GET") {
    const user = await getAdminSession(request);
    if (user) return redirect(response, "/admin", 302);
    return sendHtml(response, siteLayout(renderAdminLogin(url.searchParams), { title: "Connexion — Administration CELESTRIIUM" }));
  }
  if (pathname === "/admin/login" && request.method === "POST") return handleLogin(request, response);
  if (pathname === "/admin/logout" && request.method === "POST") {
    if (!isSameOrigin(request)) return sendText(response, 403, "Requête refusée.");
    return redirect(response, "/admin/login", 303, { "Set-Cookie": cookieOptions("", 0) });
  }

  const user = await getAdminSession(request);
  if (requireAdmin(response, user)) return;
  if (request.method === "GET" && pathname === "/admin") {
    const counts = await Promise.all([prisma.page.count(), prisma.project.count(), prisma.expertise.count(), prisma.contactMessage.count(), prisma.mediaAsset.count(), prisma.contactMessage.count({ where: { status: ContactStatus.NEW } })]);
    return sendHtml(response, siteLayout(renderAdminDashboard(user, counts), { title: "Administration — CELESTRIIUM" }));
  }
  if (request.method === "GET" && pathname === "/admin/contenus") {
    const kinds = ["pages", "expertises", "realisations", "articles"];
    const groups = await Promise.all(kinds.map((kind) => listAdminContent(kind)));
    return sendHtml(response, siteLayout(renderAdminContentIndex(groups, url.searchParams), { title: "Contenus — Administration CELESTRIIUM" }));
  }
  if (request.method === "GET" && pathname === "/admin/contenus/nouveau") return redirect(response, "/admin/contenus");
  const contentIndex = pathname.match(/^\/admin\/contenus\/(pages|expertises|realisations|articles)$/);
  if (request.method === "GET" && contentIndex) {
    const kind = contentIndex[1];
    const rows = await listAdminContent(kind);
    return sendHtml(response, siteLayout(renderAdminContentIndex([{ kind, rows }], url.searchParams), { title: "Gestion des contenus — Administration CELESTRIIUM" }));
  }
  const contentEditor = pathname.match(/^\/admin\/contenus\/(pages|expertises|realisations|articles)\/([^/]+)$/);
  if (request.method === "GET" && contentEditor) {
    const [, kind, id] = contentEditor;
    const item = id === "nouveau" ? emptyContent(kind) : await findAdminContent(kind, id);
    if (!item) return sendHtml(response, siteLayout(renderNotFound(pathname), { title: "Contenu introuvable", status: 404 }));
    const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return sendHtml(response, siteLayout(renderAdminContentEditor(kind, item, media, url.searchParams), { title: "Modifier un contenu — Administration CELESTRIIUM" }));
  }
  if (request.method === "POST" && contentEditor) return handleSaveContent(request, response, contentEditor[1], contentEditor[2]);
  if (request.method === "GET" && pathname === "/admin/media") {
    const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
    return sendHtml(response, siteLayout(renderAdminMedia(media, url.searchParams), { title: "Médias — Administration CELESTRIIUM" }));
  }
  if (request.method === "POST" && pathname === "/admin/media") return handleUploadMedia(request, response);
  if (request.method === "GET" && pathname === "/admin/messages") {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return sendHtml(response, siteLayout(renderAdminMessages(messages, url.searchParams), { title: "Messages — Administration CELESTRIIUM" }));
  }
  if (request.method === "POST" && pathname === "/admin/messages/status") return handleUpdateMessage(request, response);
  return sendHtml(response, siteLayout(renderNotFound(pathname), { title: "Page introuvable — Administration CELESTRIIUM", status: 404 }));
}

async function handleLogin(request, response) {
  if (!isSameOrigin(request)) return redirect(response, "/admin/login?error=1", 303);
  const limit = loginLimit(request);
  if (!limit.allowed) return redirect(response, "/admin/login?error=1", 303);
  let form;
  try {
    form = await readForm(request, 2_000);
  } catch {
    return redirect(response, "/admin/login?error=1", 303);
  }
  const email = form.get("email").trim().toLowerCase();
  const password = form.get("password");
  if (email.length > 254 || password.length > 200) {
    limit.current.count += 1;
    return redirect(response, "/admin/login?error=1", 303);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user?.role === "ADMIN" && user.passwordHash ? await compare(password, user.passwordHash) : false;
  if (!valid || !user) {
    limit.current.count += 1;
    return redirect(response, "/admin/login?error=1", 303);
  }
  loginAttempts.delete(limit.key);
  return redirect(response, "/admin", 303, { "Set-Cookie": cookieOptions(createSessionToken(user.id)) });
}

async function handleContact(request, response) {
  const respond = (status, message) => request.headers.accept?.includes("application/json")
    ? json(response, status, { message })
    : redirect(response, status < 400 ? "/contact?sent=1" : "/contact?error=1");
  if (!isSameOrigin(request)) return respond(403, "Envoi refusé. Recharge la page puis réessaie.");
  let form;
  try {
    form = await readForm(request, MAX_CONTACT_BYTES);
  } catch {
    return respond(413, "Le formulaire est trop volumineux.");
  }
  if (form.get("website").trim()) return respond(200, "Merci pour ton message. Nous reviendrons vers toi dès que possible.");
  const name = form.get("name").trim();
  const email = form.get("email").trim().toLowerCase();
  const organization = form.get("organization").trim();
  const jobTitle = form.get("function").trim();
  const subject = form.get("subject").trim();
  const message = form.get("message").trim();
  const privacyConsent = form.get("privacyConsent") === "on";
  const valid = name.length >= 2 && name.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 && organization.length <= 180 && jobTitle.length <= 180 && subject.length <= 180 && privacyConsent && message.length >= 10 && message.length <= 5000;
  if (!valid) return respond(422, "Vérifie les champs requis et réessaie.");
  await prisma.contactMessage.create({ data: { name, email, organization: organization || null, jobTitle: jobTitle || null, subject: subject || null, message, privacyConsent } });
  return respond(201, "Merci pour ton message. Nous reviendrons vers toi dès que possible.");
}

async function listAdminContent(kind) {
  switch (kind) {
    case "pages": return { kind, rows: await prisma.page.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true, slug: true, status: true, updatedAt: true } }) };
    case "expertises": return { kind, rows: await prisma.expertise.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }], select: { id: true, title: true, slug: true, status: true, updatedAt: true } }) };
    case "realisations": return { kind, rows: await prisma.project.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true, slug: true, status: true, updatedAt: true } }) };
    default: return { kind, rows: await prisma.article.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true, slug: true, status: true, updatedAt: true } }) };
  }
}

function emptyContent(kind) {
  return { id: null, title: "", slug: "", summary: "", body: "", status: PublicationStatus.DRAFT, seoTitle: "", seoDescription: "", client: "", challenge: "", contribution: "", results: "", coverImage: "", videoUrl: "", galleryMediaIds: [], sortOrder: 0, kind };
}

async function findAdminContent(kind, id) {
  if (kind === "pages") return prisma.page.findUnique({ where: { id } });
  if (kind === "expertises") return prisma.expertise.findUnique({ where: { id } });
  if (kind === "realisations") {
    const row = await prisma.project.findUnique({ where: { id }, include: { gallery: { orderBy: { sortOrder: "asc" }, select: { mediaAssetId: true } } } });
    return row ? { ...row, galleryMediaIds: row.gallery.map((item) => item.mediaAssetId) } : null;
  }
  const row = await prisma.article.findUnique({ where: { id } });
  return row ? { ...row, summary: row.excerpt } : null;
}

function formValue(form, key, limit) {
  const value = String(form.get(key) || "").trim();
  if (value.length > limit) throw new Error("Valeur trop longue.");
  return value;
}

async function handleSaveContent(request, response, kind, id) {
  if (!isSameOrigin(request)) return sendText(response, 403, "Requête refusée.");
  const base = `/admin/contenus/${kind}/${id}`;
  let form;
  try {
    form = await readForm(request);
  } catch {
    return redirect(response, `${base}?error=required`);
  }
  try {
    const title = formValue(form, "title", 180);
    const slug = slugify(formValue(form, "slug", 180) || title);
    const summary = formValue(form, "summary", 800);
    const body = formValue(form, "body", 30000);
    const statusValue = formValue(form, "status", 20);
    const status = Object.values(PublicationStatus).includes(statusValue) ? statusValue : PublicationStatus.DRAFT;
    if (!title || !slug || (kind !== "realisations" && !body) || (kind === "realisations" && !summary)) return redirect(response, `${base}?error=required`);
    if (kind === "pages" && ["admin", "api", "contact", "expertises", "perspectives", "realisations"].includes(slug)) return redirect(response, `${base}?error=slug`);
    const requestedCover = formValue(form, "coverImage", 2000);
    const cover = requestedCover ? await prisma.mediaAsset.findUnique({ where: { storageKey: requestedCover }, select: { storageKey: true } }) : null;
    if (requestedCover && !cover) return redirect(response, `${base}?error=image`);
    const coverImage = cover?.storageKey || null;
    const seoTitle = formValue(form, "seoTitle", 180) || null;
    const seoDescription = formValue(form, "seoDescription", 320) || null;
    const publishedAt = status === PublicationStatus.PUBLISHED ? new Date() : null;
    if (kind === "pages") {
      const data = { title, slug, summary, body, status, seoTitle, seoDescription, coverImage, publishedAt };
      if (id === "nouveau") await prisma.page.create({ data }); else await prisma.page.update({ where: { id }, data });
    } else if (kind === "expertises") {
      const rawOrder = Number(formValue(form, "sortOrder", 4));
      const data = { title, slug, summary, body, status, sortOrder: Number.isInteger(rawOrder) ? Math.max(0, Math.min(9999, rawOrder)) : 0, coverImage };
      if (id === "nouveau") await prisma.expertise.create({ data }); else await prisma.expertise.update({ where: { id }, data });
    } else if (kind === "realisations") {
      const videoInput = formValue(form, "videoUrl", 500);
      const videoUrl = videoInput && (/^\/(?!\/)/.test(videoInput) || /^https:\/\//i.test(videoInput)) ? videoInput : null;
      const galleryIds = [...new Set(form.getAll("galleryMediaIds"))].slice(0, 30);
      const assets = galleryIds.length ? await prisma.mediaAsset.findMany({ where: { id: { in: galleryIds } }, select: { id: true } }) : [];
      if (assets.length !== galleryIds.length) return redirect(response, `${base}?error=image`);
      const data = { title, slug, summary, body: summary, status, publishedAt, client: formValue(form, "client", 180) || null, challenge: formValue(form, "challenge", 5000), contribution: formValue(form, "contribution", 5000), results: formValue(form, "results", 5000), coverImage, videoUrl };
      await prisma.$transaction(async (tx) => {
        const project = id === "nouveau" ? await tx.project.create({ data }) : await tx.project.update({ where: { id }, data });
        await tx.projectGalleryImage.deleteMany({ where: { projectId: project.id } });
        if (galleryIds.length) await tx.projectGalleryImage.createMany({ data: galleryIds.map((mediaAssetId, sortOrder) => ({ projectId: project.id, mediaAssetId, sortOrder })) });
      });
    } else {
      const data = { title, slug, excerpt: summary, body, status, publishedAt, seoTitle, seoDescription, coverImage };
      if (id === "nouveau") await prisma.article.create({ data }); else await prisma.article.update({ where: { id }, data });
    }
    return redirect(response, `/admin/contenus/${kind}?saved=1`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return redirect(response, `${base}?error=slug`);
    console.error("Erreur d’enregistrement du contenu :", error);
    return redirect(response, `${base}?error=required`);
  }
}

async function handleUploadMedia(request, response) {
  if (!isSameOrigin(request)) return sendText(response, 403, "Requête refusée.");
  let bytes;
  try {
    bytes = await readRequestBody(request, MAX_MEDIA_BYTES + 64 * 1024);
  } catch {
    return redirect(response, "/admin/media?error=file");
  }
  try {
    const form = await new Request(`http://${request.headers.host || "localhost"}/admin/media`, { method: "POST", headers: request.headers, body: bytes, duplex: "half" }).formData();
    const file = form.get("file");
    const altText = String(form.get("altText") || "").trim();
    if (!(file instanceof File) || !file.size || file.size > MAX_MEDIA_BYTES || altText.length > 180) return redirect(response, "/admin/media?error=file");
    const input = Buffer.from(await file.arrayBuffer());
    if (!detectImage(input)) return redirect(response, "/admin/media?error=type");
    const optimized = await sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toBuffer();
    const filename = `${randomUUID()}.webp`;
    const storageKey = `/uploads/${filename}`;
    const directory = safeMediaDirectory();
    await mkdir(directory, { recursive: true });
    const filePath = path.join(directory, filename);
    await writeFile(filePath, optimized, { flag: "wx" });
    try {
      await prisma.mediaAsset.create({ data: { filename: path.basename(file.name).slice(0, 180) || filename, storageKey, mimeType: "image/webp", sizeBytes: optimized.length, altText } });
    } catch (error) {
      await unlink(filePath).catch(() => undefined);
      throw error;
    }
    return redirect(response, "/admin/media?saved=1");
  } catch (error) {
    console.error("Échec du traitement de l’image :", error);
    return redirect(response, "/admin/media?error=decode");
  }
}

async function handleUpdateMessage(request, response) {
  if (!isSameOrigin(request)) return sendText(response, 403, "Requête refusée.");
  try {
    const form = await readForm(request, 5_000);
    const id = form.get("id");
    const status = form.get("status");
    if (!id || !Object.values(ContactStatus).includes(status)) return redirect(response, "/admin/messages?error=1");
    await prisma.contactMessage.update({ where: { id }, data: { status } });
    return redirect(response, "/admin/messages?saved=1");
  } catch {
    return redirect(response, "/admin/messages?error=1");
  }
}

async function getStaticSiteData() {
  const site = structuredClone(STATIC_SITE_DATA);
  try {
    const [expertises, projects, articles] = await Promise.all([
      prisma.expertise.findMany({ where: { status: PublicationStatus.PUBLISHED }, orderBy: { sortOrder: "asc" }, select: { title: true, slug: true, summary: true } }),
      prisma.project.findMany({ where: { status: PublicationStatus.PUBLISHED }, orderBy: { publishedAt: "desc" }, take: 6, select: { title: true, slug: true, client: true, summary: true, coverImage: true, challenge: true, contribution: true, results: true, gallery: { orderBy: { sortOrder: "asc" }, select: { mediaAsset: { select: { storageKey: true, altText: true } } } } } }),
      prisma.article.findMany({ where: { status: PublicationStatus.PUBLISHED }, orderBy: { publishedAt: "desc" }, take: 6, select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true } }),
    ]);
    if (expertises.length) site.expertises = expertises.map((item, index) => ({ ...(STATIC_SITE_DATA.expertises[index] || { n: [] }), t: item.title, d: item.summary || item.title }));
    if (projects.length) {
      site.projects = projects.map((item, index) => {
        const fallback = STATIC_SITE_DATA.projects[index] || {};
        const legacyHref = item.slug.includes("rivotra") ? "rivotra-freedom-cup-2026.html" : item.slug.includes("cdc") ? "cdc-immersion.html" : "realisations.html";
        return { ...fallback, href: legacyHref, title: item.title, summary: item.summary || fallback.summary || "", image: item.coverImage || fallback.image || "public/illustrations/photos/community.jpg", alt: item.title, client: item.client || undefined };
      });
      const rivotra = projects.find((item) => item.slug.includes("rivotra"));
      if (rivotra) {
        if (rivotra.summary) site.rivotra.intro = rivotra.summary;
        if (rivotra.challenge) site.rivotra.context = rivotra.challenge;
        if (rivotra.contribution) site.rivotra.roleC = rivotra.contribution;
        if (rivotra.results) site.rivotra.resultsNote = rivotra.results;
        const gallery = rivotra.gallery.map(({ mediaAsset }) => ({ src: mediaAsset.storageKey, alt: mediaAsset.altText || rivotra.title, cap: mediaAsset.altText || rivotra.title }));
        if (gallery.length) site.rivotra.gallery = gallery;
      }
      const cdc = projects.find((item) => item.slug.includes("cdc"));
      if (cdc) {
        if (cdc.summary) site.cdcImmersion.intro = cdc.summary;
        if (cdc.challenge) site.cdcImmersion.context = cdc.challenge;
        const gallery = cdc.gallery.map(({ mediaAsset }) => ({ src: mediaAsset.storageKey, alt: mediaAsset.altText || cdc.title, cap: mediaAsset.altText || cdc.title }));
        if (gallery.length) site.cdcImmersion.gallery = gallery;
      }
    }
    if (articles.length) site.articles = articles.map((item) => ({ title: item.title, summary: item.excerpt, date: item.publishedAt?.toISOString().slice(0, 10) || "", image: item.coverImage || "public/illustrations/photos/market.jpg", alt: item.title, href: "perspectives.html", example: false }));
  } catch (error) {
    console.error("Le contenu public utilise les donn\u00e9es de secours :", error);
  }
  return site;
}

const server = createServer(async (request, response) => {
  securityHeaders(response);
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const pathname = decodeURI(url.pathname);
    if (request.method === "GET" || request.method === "HEAD") {
      if (pathname === "/api/site-content") return json(response, 200, await getStaticSiteData());
      const legacyPages = {
        "/": "index.html", "/index.html": "index.html",
        "/a-propos": "a-propos.html", "/a-propos.html": "a-propos.html",
        "/expertises": "expertises.html", "/expertises.html": "expertises.html",
        "/partenariats": "partenariats.html", "/partenariats.html": "partenariats.html",
        "/perspectives": "perspectives.html", "/perspectives.html": "perspectives.html",
        "/contact": "contact.html", "/contact.html": "contact.html",
        "/realisations": "realisations.html", "/realisations.html": "realisations.html",
        "/realisations/cdc-immersion": "cdc-immersion.html", "/cdc-immersion.html": "cdc-immersion.html",
        "/realisations/rivotra-freedom-cup": "rivotra-freedom-cup-2026.html",
        "/realisations/rivotra-freedom-cup-2026": "rivotra-freedom-cup-2026.html",
        "/rivotra-freedom-cup-2026.html": "rivotra-freedom-cup-2026.html",
      };
      const staticPage = legacyPages[pathname]
        || (/^\/expertises\/[^/]+$/.test(pathname) ? "expertises.html" : null)
        || (/^\/realisations\/[^/]+$/.test(pathname) ? "realisations.html" : null)
        || (/^\/perspectives\/[^/]+$/.test(pathname) ? "perspectives.html" : null);
      if (staticPage) {
        const page = await readFile(path.join(ROOT, staticPage));
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Length": page.length, "Cache-Control": "no-cache" });
        return response.end(request.method === "HEAD" ? undefined : page);
      }
      if (await serveStatic(request, response, pathname)) return;
      if (pathname === "/favicon.ico") return sendText(response, 404, "Not found");
      if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
        const page = await renderPublicPage(pathname, url.searchParams);
        response.writeHead(page.status, { "Content-Type": page.contentType, "Cache-Control": "public, max-age=3600" });
        return response.end(page.body);
      }
      if (pathname === "/admin" || pathname.startsWith("/admin/")) return await adminRouter(request, response, url);
      const page = await renderPublicPage(pathname.replace(/\/$/, "") || "/", url.searchParams);
      return sendHtml(response, page);
    }
    if (request.method === "POST" && pathname === "/contact") return await handleContact(request, response);
    if (request.method === "POST" && pathname.startsWith("/admin/")) return await adminRouter(request, response, url);
    sendText(response, 405, "Method not allowed");
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    console.error(`Erreur serveur ${status} ${request.method} ${request.url}:`, error);
    if (!response.headersSent) sendText(response, status, status === 413 ? "Payload trop volumineux." : "Une erreur interne est survenue.");
    else response.destroy();
  }
});

server.listen(PORT, "0.0.0.0", () => console.log(`CELESTRIIUM en HTML/CSS/JavaScript : http://localhost:${PORT}`));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
