import {Injectable} from '@angular/core';
import {IDBPDatabase, openDB} from 'idb';
import {TableMetadata} from '../types/commType';

@Injectable({
  providedIn: 'root'
})
export class IndexDbService {
  private readonly dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  async isUsersTableEmpty(): Promise<boolean> {
    const db = await this.dbPromise;
    const tx = db.transaction('tableMetadata', 'readonly');
    const store = tx.objectStore('tableMetadata');

    // 使用游标来判断表中是否有记录
    const cursor = await store.openCursor();

    // 如果游标返回的是 null，说明没有记录
    return cursor === null;
  }

  // 初始化数据库
  private async initDB(): Promise<IDBPDatabase> {
    return openDB('tableMetadataDatabase', 1, {
      upgrade(db) {
        if (db.objectStoreNames.contains('tableMetadata')) {
          return;
        }
        const tableMetadataStore = db.createObjectStore('tableMetadata', {keyPath: 'tableName'});
        tableMetadataStore.createIndex('tableComment', 'tableComment', {unique: false});
        tableMetadataStore.createIndex('columnNameForIdx', 'columnNameForIdx', {unique: false, multiEntry: true}); // 多值索引
        tableMetadataStore.createIndex('columnCommentForIdx', 'columnCommentForIdx', {unique: false, multiEntry: true}); // 多值索引
      }
    });
  }

  async getAllTableMetadata(): Promise<TableMetadata[]> {
    const db = await this.dbPromise;
    const tx = db.transaction('tableMetadata', 'readonly');
    const store = tx.objectStore('tableMetadata');
    const tableMetadata = await store.getAll(); // 获取所有数据
    await tx.done;
    return tableMetadata;
  }

  async getTableMetadataByTableName(tableName: string): Promise<TableMetadata[] | undefined> {
    const db = await this.dbPromise;
    let byPk = await db.transaction('tableMetadata', 'readonly').objectStore('tableMetadata').get(tableName) as TableMetadata | undefined;
    if (byPk) {
      return [byPk];
    } else {
      let idbpObjectStore = db.transaction('tableMetadata', 'readonly').objectStore('tableMetadata');
      let all = await idbpObjectStore.getAll() as TableMetadata[];
      if (all) {
        return all.filter(record =>
          record.tableName.includes(tableName)
        );
      } else {
        return [];
      }
    }
  }

  async searchTableMetadataByTableComment(tableComment: string): Promise<TableMetadata[]> {
    const db = await this.dbPromise;
    const tx = db.transaction('tableMetadata', 'readonly');
    const store = tx.objectStore('tableMetadata');
    const index = store.index('tableComment');
    const tableMetadata: TableMetadata[] = [];

    let cursor = await index.openCursor();
    while (cursor) {
      let key = cursor.key as string;
      if (key.includes(tableComment)) {
        tableMetadata.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    return tableMetadata;
  }

  // 插入一个
  async addTableMetadata(tableMetadata: TableMetadata): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('tableMetadata', 'readwrite');
    let columnNames = tableMetadata.columns.map(t => t.name);
    let columnComments = tableMetadata.columns.map(t => t.comment);
    tableMetadata.columnNameForIdx = columnNames;
    tableMetadata.columnCommentForIdx = [...new Set(columnComments)];
    await tx.objectStore('tableMetadata').put(tableMetadata);
    await tx.done;
  }

  async searchTableMetadataByColumnName(query: string): Promise<TableMetadata[]> {
    const db = await this.dbPromise;
    const tx = db.transaction('tableMetadata', 'readonly');
    const index = tx.objectStore('tableMetadata').index('columnNameForIdx');
    const tableMetadata: TableMetadata[] = [];

    let cursor = await index.openCursor();
    while (cursor) {
      const name = cursor.key as string; // 索引值
      if (name.includes(query)) {
        tableMetadata.push(cursor.value); // 如果包含查询字符串，添加到结果
      }
      cursor = await cursor.continue();
    }
    return tableMetadata;
  }

  async searchTableMetadataByColumnComment(query: string): Promise<TableMetadata[]> {
    const db = await this.dbPromise;
    const tx = db.transaction('tableMetadata', 'readonly');
    const index = tx.objectStore('tableMetadata').index('columnCommentForIdx');
    const tableMetadata: TableMetadata[] = [];

    let cursor = await index.openCursor();
    while (cursor) {
      const comment = cursor.key as string; // 索引值
      if (comment.includes(query)) {
        tableMetadata.push(cursor.value); // 如果包含查询字符串，添加到结果
      }
      cursor = await cursor.continue();
    }
    return tableMetadata;
  }


  // 清除所有
  async clearAllTableMetadata(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('tableMetadata', 'readwrite');
    await tx.objectStore('tableMetadata').clear();
    await tx.done;
  }
}
