// Validates every GraphQL operation in the frontend against the backend schema, so a renamed field, a changed
// type or a removed argument fails here instead of as a blank page at runtime.
//
//   npm run check:graphql
//   GRAPHQL_SCHEMA_DIR=path/to/graphql npm run check:graphql
//
// The frontend writes its operations as template literals (`query X { ... }`) passed to gqlRequest. This finds
// every literal that starts with query / mutation / fragment, resolves `${NAME}` from a `const NAME = \`...\``
// in the same file (shared field lists), and validates the result with graphql-js. Exits 1 if any is invalid.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSchema, parse, validate } from "graphql";

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaDir = path.resolve(
    process.env.GRAPHQL_SCHEMA_DIR ?? path.join(frontendDir, "../backend/src/main/resources/graphql"),
);

const sdl = fs.readdirSync(schemaDir)
    .filter((f) => /\.(graphqls?|gqls)$/.test(f))
    .map((f) => fs.readFileSync(path.join(schemaDir, f), "utf8"))
    .join("\n");
const schema = buildSchema(sdl);

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "scripts"]);

function* sourceFiles(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* sourceFiles(p);
        else if (/\.(ts|tsx)$/.test(entry.name)) yield p;
    }
}

const OPERATION_START = /^\s*(#[^\n]*\n\s*)*(query|mutation|subscription|fragment)\b/;
let checked = 0;
let invalid = 0;
const unresolved = [];

for (const file of sourceFiles(frontendDir)) {
    const raw = fs.readFileSync(file, "utf8");
    const consts = {};
    for (const c of raw.matchAll(/const\s+(\w+)\s*=\s*`([^`]*)`/g)) consts[c[1]] = c[2];

    for (const m of raw.matchAll(/`([^`]*)`/g)) {
        let body = m[1];
        // A real operation has a selection set; this skips prose like a comment mentioning `query`.
        if (!OPERATION_START.test(body) || !body.includes("{")) continue;
        // Expand ${NAME} a few times so a field list can itself include another one.
        for (let i = 0; i < 3; i++) {
            body = body.replace(/\$\{(\w+)\}/g, (all, name) => consts[name] ?? all);
        }
        const where = `${path.relative(frontendDir, file).replace(/\\/g, "/")}:${raw.slice(0, m.index).split("\n").length}`;
        if (body.includes("${")) {
            unresolved.push(where);
            continue;
        }

        checked++;
        let doc;
        try {
            doc = parse(body);
        } catch (e) {
            invalid++;
            console.log(`${where}\n   - ${e.message}`);
            continue;
        }
        const errors = validate(schema, doc);
        if (errors.length) {
            invalid++;
            console.log(`${where}  ${doc.definitions[0]?.name?.value ?? "(anonymous)"}`);
            for (const err of errors) console.log(`   - ${err.message}`);
        }
    }
}

console.log(`\n${checked} operations checked against ${path.relative(frontendDir, schemaDir)}: ${invalid} invalid.`);
if (unresolved.length) {
    console.log(`${unresolved.length} not checked (interpolation from another file):`);
    for (const u of unresolved) console.log(`   ${u}`);
}
process.exit(invalid > 0 ? 1 : 0);
