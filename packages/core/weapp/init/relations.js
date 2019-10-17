export function patchRelations(output, relations) {
  if (!relations) {
    relations = {};
  }
  output.relations = relations;
}
