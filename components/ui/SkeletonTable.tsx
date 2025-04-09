type SkeletonTableProps = {
  columns: number;
  rows: number;
};

const SkeletonTable = ({columns, rows}: SkeletonTableProps) => (
  <>
    {[...Array(rows)].map((_, rowIndex) => (
      <tr key={rowIndex}>
        {[...Array(columns)].map((_, colIndex) => (
          <td key={colIndex} className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default SkeletonTable;
