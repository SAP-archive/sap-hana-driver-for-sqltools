import { IBaseQueries, ContextValue } from '@sqltools/types';
import queryFactory from '@sqltools/base-driver/dist/lib/factory';


/** write your queries here go fetch desired data. This queries are just examples copied from SQLite driver */

const describeTable: IBaseQueries['describeTable'] = queryFactory`
SELECT *
FROM
${p=> p.isView?'VIEW_COLUMNS':'TABLE_COLUMNS'} C
WHERE
  C.SCHEMA_NAME = '${p => p.schema}' and C.${p=> p.isView?'VIEW_NAME':'TABLE_NAME'} = '${p => p.label}'`

const fetchColumns: IBaseQueries['fetchColumns'] = queryFactory`
SELECT
  C.COLUMN_NAME AS "label",
  C.CS_DATA_TYPE_NAME AS "dataType",
  C.DEFAULT_VALUE as "defaultValue",
  C.IS_NULLABLE as "isNullable",
  'column' as "iconName",
  'NO_CHILD' as "childType"
FROM
  ${p=> p.isView?'VIEW_COLUMNS':'TABLE_COLUMNS'} C
WHERE
  C.SCHEMA_NAME = '${p => p.schema}' AND
  C.${p=> p.isView?'VIEW_NAME':'TABLE_NAME'} = '${p => p.label}'
ORDER BY C.COLUMN_NAME ASC
`;



const fetchRecords: IBaseQueries['fetchRecords'] = queryFactory`
SELECT *
FROM ${p => (p.table.label || p.table)}
LIMIT ${p => p.limit || 50}
OFFSET ${p => p.offset || 0}
`;

const countRecords: IBaseQueries['countRecords'] = queryFactory`
SELECT COUNT(*) AS "total"
FROM ${p => (p.table.label || p.table)}
`;

const fetchTablesAndViews = (type: ContextValue): IBaseQueries['fetchTables'] => {
  switch (type) {
    case ContextValue.TABLE:
      return queryFactory`
        SELECT
          A.TABLE_NAME AS "label",
          '${type}' as "type",
          '${p => p.schema}' as "schema",
          'table' as "iconName",
          0 as "isView"
        FROM
          TABLE_COLUMNS A
        WHERE 
          A.SCHEMA_NAME = '${p => p.schema}'
        GROUP BY 
          A.TABLE_NAME 
`
    case ContextValue.VIEW:
      return queryFactory`
      SELECT
        B.VIEW_NAME AS "label",
        '${type}' as "type",
        '${p => p.schema}' as "schema",
        1 as "isView",
        'view' as "iconName"
      FROM
        VIEW_COLUMNS B
      WHERE 
        B.SCHEMA_NAME = '${p => p.schema}'
      GROUP BY 
        B.VIEW_NAME  
`
  }
}


const fetchTables: IBaseQueries['fetchTables'] = fetchTablesAndViews(ContextValue.TABLE);
const fetchViews: IBaseQueries['fetchTables'] = fetchTablesAndViews(ContextValue.VIEW);// , 'view');

const searchTables: IBaseQueries['searchTables'] = queryFactory`
SELECT name AS label,
  type
FROM sqlite_master
${p => p.search ? `WHERE LOWER(name) LIKE '%${p.search.toLowerCase()}%'` : ''}
ORDER BY name
`;
const searchColumns: IBaseQueries['searchColumns'] = queryFactory`
SELECT C.name AS label,
  T.name AS "table",
  C.type AS dataType,
  C."notnull" AS isNullable,
  C.pk AS isPk,
  '${ContextValue.COLUMN}' as type
FROM sqlite_master AS T
LEFT OUTER JOIN pragma_table_info((T.name)) AS C ON 1 = 1
WHERE 1 = 1
${p => p.tables.filter(t => !!t.label).length
    ? `AND LOWER(T.name) IN (${p.tables.filter(t => !!t.label).map(t => `'${t.label}'`.toLowerCase()).join(', ')})`
    : ''
  }
${p => p.search
    ? `AND (
    LOWER(T.name || '.' || C.name) LIKE '%${p.search.toLowerCase()}%'
    OR LOWER(C.name) LIKE '%${p.search.toLowerCase()}%'
  )`
    : ''
  }
ORDER BY C.name ASC,
  C.cid ASC
LIMIT ${p => p.limit || 100}
`;

export default {
  describeTable,
  countRecords,
  fetchColumns,
  fetchRecords,
  fetchTables,
  fetchViews,
  searchTables,
  searchColumns
}
