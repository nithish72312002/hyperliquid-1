import { HttpTransport, PublicClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<PublicClient["allMids"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("allMids", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const transport = new HttpTransport({ isTestnet: true });
    const client = new PublicClient({ transport });

    // —————————— Test ——————————

    const data = await Promise.all([
        client.allMids(),
        client.allMids({ dex: "test" }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
