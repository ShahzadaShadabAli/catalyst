import { Photo, Pin } from "@/components/craft";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeader } from "@/components/site/SectionHeader";
import type { Leader } from "@/lib/schemas";
import { cn, tilt } from "@/lib/utils";

type Node = Leader & { children: Node[] };

/** Build a forest from parentId links. Broken links and cycles fall back to the top level. */
export function buildTree(leaders: Leader[]): Node[] {
  const byId = new Map<string, Node>(leaders.map((l) => [l.id, { ...l, children: [] }]));
  const roots: Node[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    let cyclic = false;
    for (let p = parent, steps = 0; p && steps < 50; p = p.parentId ? byId.get(p.parentId) : undefined, steps++) {
      if (p.id === node.id) {
        cyclic = true;
        break;
      }
    }
    if (parent && !cyclic) parent.children.push(node);
    else roots.push(node);
  }
  const sort = (list: Node[]) => {
    list.sort((a, b) => a.order - b.order);
    list.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

function LeaderCard({ node, index, depth }: { node: Node; index: number; depth: number }) {
  return (
    <Reveal variant="drop" rotate={tilt(index, 0.8)} delay={depth * 0.12} lift className="relative z-[1]">
      <article
        className={cn(
          "polaroid polaroid-sm flex items-center gap-3 !pb-3 md:w-[164px] md:flex-col md:gap-0 md:!pb-4",
          depth === 0 && "md:w-[190px]",
        )}
      >
        <Pin className="left-1/2 -top-2 -translate-x-1/2" color={depth === 0 ? "" : depth === 1 ? "pin-blush" : "pin-butter"} />
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-paper-2 md:aspect-square md:size-auto md:w-full md:rounded-none">
          <Photo image={node.photo} sizes="(max-width: 768px) 64px, 190px" fallbackLabel={node.name} />
        </div>
        <div className="min-w-0 md:mt-3 md:text-center">
          <h3 className="font-hand text-2xl leading-none text-ink">{node.name}</h3>
          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-sage-deep">{node.role}</p>
          {node.bio ? <p className="mt-2 text-xs leading-snug text-muted md:px-1">{node.bio}</p> : null}
        </div>
      </article>
    </Reveal>
  );
}

function Branch({ nodes, depth }: { nodes: Node[]; depth: number }) {
  return (
    <ul>
      {nodes.map((n, i) => (
        <li key={n.id}>
          <LeaderCard node={n} index={i + depth} depth={depth} />
          {n.children.length ? <Branch nodes={n.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function Leadership({ leaders }: { leaders: Leader[] }) {
  const tree = buildTree(leaders);
  return (
    <Section id="team" className="overflow-hidden">
      <SectionHeader
        number={3}
        label="Leadership"
        eyebrow="The people holding the yarn"
        title="Who's who."
        intro="Every thread leads somewhere. Here's how our team is strung together."
      />
      {tree.length ? (
        <div className="-mx-5 overflow-x-auto px-5 pb-6 pt-4 md:mx-0 md:px-0">
          <div className="tree mx-auto w-max min-w-full max-md:w-full">
            <Branch nodes={tree} depth={0} />
          </div>
        </div>
      ) : (
        <p className="text-center font-hand text-2xl text-muted">Our leadership team will be pinned up here soon.</p>
      )}
    </Section>
  );
}
