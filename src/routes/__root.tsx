import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      {
        name: "description",
        content: "Tamires Lelis — Product Design portfolio, presented as a Windows XP desktop.",
      },
      { title: "Tamires Lelis — Portfolio" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // favicon.svg lives in public/, so — unlike appCss above — it never
      // passes through Vite's asset pipeline to get the configured base
      // path applied automatically. import.meta.env.BASE_URL adds it
      // manually, so this still resolves correctly under a subpath (e.g.
      // GitHub Pages' `/<repo-name>/`), not just at the domain root.
      { rel: "icon", type: "image/svg+xml", href: `${import.meta.env.BASE_URL}favicon.svg` },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <noscript>Please enable JavaScript to view this portfolio.</noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
