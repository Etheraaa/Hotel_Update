import GeneratorPage from "../../components/generator/generator-page";
import { getPhrasingApi } from "../../lib/server-api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const meta = getPhrasingApi().getMeta();

  return <GeneratorPage meta={meta} />;
}
