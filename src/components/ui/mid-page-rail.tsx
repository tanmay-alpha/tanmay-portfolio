import { CommitFeed } from "./commit-feed";

/**
 * Mid-page rail — wraps the Work / More Work / Experience sections.
 * The right column holds a sticky commit feed that stays visible while
 * the user scrolls through those sections. Hero, Contact, and Footer
 * sit outside this rail, so the commit feed does not appear there.
 *
 * Layout: a flex row. Children flow on the left (10/12 cols), the
 * commit feed is a 2/12 col sticky aside on the right. On smaller
 * viewports the aside is hidden and children take the full width.
 */
export function MidPageRail({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <div className="min-w-0 flex-1">{children}</div>
          <aside
            aria-label="Live GitHub commit feed"
            className="hidden w-[240px] shrink-0 lg:block"
          >
            <div className="sticky top-24">
              <CommitFeed />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
