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
  default: boolean;
}

export interface tableMetadata {
  tableName: string;
  tableComment: string;
  columns: Column[];
}

type DbType = 0 | 1 | 2
