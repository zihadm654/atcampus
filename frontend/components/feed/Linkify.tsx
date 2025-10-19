import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";

import UserLinkWithTooltip from "./../UserLinkWithTooltip";

interface LinkifyProps {
  children: React.ReactNode;
}

export default function Linkify({ children }: LinkifyProps) {
  return (
    <LinkifyUsername>
      <LinkifyHashtag>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  );
}

function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}

function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      component={(match, key) => (
        <UserLinkWithTooltip key={key} username={match.slice(1)}>
          {match}
        </UserLinkWithTooltip>
      )}
      regex={/(@[a-zA-Z0-9_-]+)/}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHashtag({ children }: LinkifyProps) {
  return (
    <LinkIt
      component={(match, key) => (
        <Link
          className="text-primary hover:underline"
          href={`/hashtag/${match.slice(1)}`}
          key={key}
        >
          {match}
        </Link>
      )}
      regex={/(#[a-zA-Z0-9]+)/}
    >
      {children}
    </LinkIt>
  );
}
