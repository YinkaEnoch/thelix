export const sortTasksUtil = (
  data: Record<string, any>[],
  columnName: string,
  sortDirection: "asc" | "desc",
) => {
  if (data.length < 1) return;

  const newData = [...data].sort((a, b) => {
    const valueA = a[columnName];
    const valueB = b[columnName];

    if (typeof valueA === "number" && typeof valueB === "number") {
      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }
    }

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return 0;
  });

  const newDirection = sortDirection === "asc" ? "desc" : "asc";

  return { direction: newDirection, data: newData };
};
