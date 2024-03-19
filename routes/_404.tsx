export function handler(request: Request) {
  return Response.redirect(new URL("/", request.url));
}
