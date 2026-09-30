import { posts } from "./posts";
import { services } from "./services";
import { projects } from "./site";
export const publicPaths = [
  "/",
  "/about",
  "/work",
  "/showcase",
  "/services",
  "/contact",
  "/blog",
  "/privacy",
  "/terms",
  ...posts.map((p) => "/blog/" + p.slug),
  ...services.map((s) => "/services/" + s.slug),
  ...projects.map((p) => "/work/" + p.slug),
];
