export const AG_HEADER_HEIGHT = 48;
export const AG_ROW_HEIGHT = 52;

export function agTableHeight(rowCount: number) {
  return AG_HEADER_HEIGHT + Math.max(rowCount, 1) * AG_ROW_HEIGHT;
}
