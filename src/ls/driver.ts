import AbstractDriver from '@sqltools/base-driver';
import queries from './queries';
import sqltoolsRequire from '@sqltools/base-driver/dist/lib/require';
import { IConnectionDriver, MConnectionExplorer, NSDatabase, ContextValue, Arg0, IQueryOptions } from '@sqltools/types';
//import { v4 as generateId } from 'uuid';

/**
 * set Driver lib to the type of your connection.
 * Eg for postgres:
 * import { Pool, PoolConfig } from 'pg';
 * ...
 * type DriverLib = Pool;
 * type DriverOptions = PoolConfig;
 *
 * This will give you completions iside of the library
 */
type DriverLib = any;
type DriverOptions = any;

interface Statement {
  exec(params: any[], handler: (err: any, row: any) => void);
}

interface HanaConnection {
  connect(handler: (err: any) => void);
  exec(query: string, handler: (err: any, row: any) => void);
  disconnect();
  prepare(query: string, handler: (err: any, statement: Statement) => void);
}

interface HanaClientModule {
  createConnection(connOptions: Record<string, unknown>): HanaConnection;
}

export default class SAPHana extends AbstractDriver<DriverLib, DriverOptions> implements IConnectionDriver {

  
  public readonly deps: typeof AbstractDriver.prototype['deps'] = [{
    type: AbstractDriver.CONSTANTS.DEPENDENCY_PACKAGE,
    name: '@sap/hana-client'
  }];


  queries = queries;
  private schema: string;

  private get lib() {
    return sqltoolsRequire('@sap/hana-client') as HanaClientModule;
  }

  public open(): Promise<HanaConnection> {
    if (this.connection) {
      return this.connection;
    }

    //this.needToInstallDependencies();
    let connOptions = {
      HOST: this.credentials.server,
      PORT: this.credentials.port,
      UID: this.credentials.username,
      PWD: this.credentials.password
    }
    if (this.credentials.connectionTimeout && this.credentials.connectionTimeout > 0) {
      connOptions["CONNECTTIMEOUT"] = this.credentials.connectionTimeout * 1000;
    }

    connOptions = {
      ...connOptions,
      ...(this.credentials["hanaOptions"] || {}),
    };

    try {
      const conn = this.lib.createConnection(connOptions);

      this.connection = new Promise<HanaConnection>((resolve, reject) => conn.connect(err => {
        if (err) {
          this.log.extend('error')("Connection to SAP HANA failed", err.toString());
          reject(err);
        }
        this.schema = this.credentials.database;
        conn.exec("SET SCHEMA " + this.schema, err => {
          if (err) {
            reject(err);
          }

          this.log.extend('debug')("Connection to SAP Hana succeeded!");
          resolve(conn);
        });
      }));
      return this.connection;
    } catch (e) {
      this.log.extend('error')("Connection to SAP HANA failed" + e.toString());
      Promise.reject(e);
    }

    return this.connection;
  }

  public async close() {
    if (!this.connection) return;
    if (!this.connection) return;

    await this.connection.then(conn => conn.disconnect());
    this.connection = null;
  }

  public query: (typeof AbstractDriver)['prototype']['query'] = async (query, opt = {}) => {
    //console.log("..query: "+ query);
    return this.open().then(conn => {
      return new Promise<NSDatabase.IResult[]>((resolve) => {
        const params = this.getParams(opt);

        if (params.length > 0) {
          conn.prepare(query.toString(), (err, statement) => {
            if (err) {
              return this.resolveErr(resolve, err, query);
            }
            statement.exec(params, (err, rows) => {
              if (err) {
                return this.resolveErr(resolve, err, query);
              }
              return this.resolveQueryResults(resolve, rows, query);
            });
          });
        } else {
          conn.exec(query.toString(), (err, rows) => {
            if (err) {
              return this.resolveErr(resolve, err, query);
            }
            return this.resolveQueryResults(resolve, rows, query);
          });
        }
      });
    });
  }

  private getParams(opt: IQueryOptions): any[] {
    const ret = [];
    Object.keys(opt).forEach(key => {
      if (key !== 'requestId' && 
          key !== 'limit' && 
          key !== 'page' && 
          key !== 'connId' && 
          opt[key]) {
        ret.push(opt[key]);
        //console.log("param:"+key + ":" +opt[key])
      }
    })
    return ret;
  }
  private resolveQueryResults(resolve, rows, query) {
    const cols: string[] = [];
    if (rows && rows.length > 0) {
      for (const colName in rows[0]) {
        //console.log("col: "+ colName);
        cols.push(colName);
      }
    }

    const res = {
      connId: this.getId(),
      results: rows,
      cols: cols,
      query: query,
      messages: []
    } as NSDatabase.IResult

    return resolve([res]);
  }

  private resolveErr(resolve, err, query) {
    const messages: string[] = [];
    if (err.message) {
      messages.push(err.message);
      console.log("query error:"+err.message)
    }

    return resolve([{
      connId: this.getId(),
      error: err,
      results: [],
      cols: [],
      query: query,
      messages: messages
    } as NSDatabase.IResult]);
  }

  public async testConnection() {
    await this.open()
    await this.query('SELECT 1 from dummy', {});
  }

  /**
   * This method is a helper to generate the connection explorer tree.
   * it gets the child items based on current item
   */
  public async getChildrenForItem({ item, parent }: Arg0<IConnectionDriver['getChildrenForItem']>) {
    switch (item.type) {
        case ContextValue.CONNECTION:
        case ContextValue.CONNECTED_CONNECTION:
          return <MConnectionExplorer.IChildItem[]>[
            { schema: this.schema, label: 'Tables', type: ContextValue.RESOURCE_GROUP, iconId: 'folder', childType: ContextValue.TABLE },
            { schema: this.schema, label: 'Views', type: ContextValue.RESOURCE_GROUP, iconId: 'folder', childType: ContextValue.VIEW },
            //{ label: 'Functions', type: ContextValue.RESOURCE_GROUP, iconId: 'folder', childType: ContextValue.FUNCTION },
          ];
        case ContextValue.TABLE:
        case ContextValue.VIEW:
          return this.queryResults(this.queries.fetchColumns(item as NSDatabase.ITable));
          
        case ContextValue.RESOURCE_GROUP:
          return this.getChildrenForGroup({ item, parent });
    }
    return [];
  }

  
  private async getChildrenForGroup({  item }: Arg0<IConnectionDriver['getChildrenForItem']>) {
    switch (item.childType) {
      case ContextValue.TABLE:
        return this.queryResults(this.queries.fetchTables(item as NSDatabase.ISchema));
      case ContextValue.VIEW:
        return this.queryResults(this.queries.fetchViews(item as NSDatabase.ISchema));
      // case ContextValue.FUNCTION:
      //   return this.queryResults(this.queries.fetchFunctions(parent as NSDatabase.ISchema));
      
    }
    return [];
  }

  /**
   * This method is a helper for intellisense and quick picks.
   */
  public async searchItems(itemType: ContextValue, search: string, extraParams: any = {}): Promise<NSDatabase.SearchableItem[]> {
    switch (itemType) {
      case ContextValue.TABLE:
        return this.queryResults(this.queries.searchTables({ search }));
      case ContextValue.COLUMN:
        return this.queryResults(this.queries.searchColumns({ search, ...extraParams }));
    }
    return [];
  }

  public getStaticCompletions: IConnectionDriver['getStaticCompletions'] = async () => {
    return {};
  }
}
