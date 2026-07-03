/**
 * PubChem proxy (Module 3 · §3.2). Resolves a compound to a 3D SDF server-side
 * (avoids CORS) so <Molecule3D> can show any compound the bundled library does
 * not already ship. Falls back to a 2D record when no 3D conformer exists.
 *
 *   GET /api/molecule?cid=2244
 *   GET /api/molecule?name=toluene
 */
const PUBCHEM = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cid = searchParams.get("cid");
  const name = searchParams.get("name");

  if (!cid && !name) {
    return new Response("Provide a `cid` or `name` query parameter.", {
      status: 400,
    });
  }

  const url3d = cid
    ? `${PUBCHEM}/compound/cid/${encodeURIComponent(cid)}/SDF?record_type=3d`
    : `${PUBCHEM}/compound/name/${encodeURIComponent(name!)}/SDF?record_type=3d`;

  try {
    let res = await fetch(url3d);
    // Some compounds have no precomputed 3D conformer — fall back to 2D.
    if (!res.ok && name) {
      res = await fetch(
        `${PUBCHEM}/compound/name/${encodeURIComponent(name)}/SDF`,
      );
    }
    if (!res.ok) {
      return new Response("No structure found for that compound.", {
        status: res.status === 404 ? 404 : 502,
      });
    }

    const sdf = await res.text();
    if (!sdf.includes("V2000") && !sdf.includes("V3000")) {
      return new Response("No structure found for that compound.", {
        status: 404,
      });
    }

    return new Response(sdf, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Error contacting PubChem.", { status: 502 });
  }
}
