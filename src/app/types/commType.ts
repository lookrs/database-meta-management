export interface DbConnInfo {
  dbType: DbType;
  url: string;
  username: string;
  password: string;
}

export interface Column {
  name: string;
  type: string;
  comment: string;
  nullable: boolean;
  defaultValue: string;
}

export interface TableMetadata {
  tableName: string;
  tableComment: string;
  columns: Column[];
  columnNameForIdx?: string[];
  columnCommentForIdx?: string[];
}

export interface Supports {
  dbType: number;
  sampleUrl: string;
}

export type DbType = 0 | 1 | 2
