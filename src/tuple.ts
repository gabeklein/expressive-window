import Model, { set } from "@expressive/mvc";

export function tuple<T extends any[]>(tuple: T): T;
export function tuple<T extends any[]>(...args: T): T;
export function tuple<T extends any[]>(): T | undefined;
export function tuple<T extends any[]>(...args: T): T | undefined {
  return set(
    function tuple(this: Model.Controller, key: string){
      let current: T | undefined;
  
      if(args.length == 0)
        current = undefined as any;
      else if(args.length == 1 && typeof args[0] == "object")
        current = args[0] as any;
  
      this.manage(key, args, (value: T) => {
        let isNew = false;
  
        if(!current){
          isNew = true;
          current = value;
        }
        else // compare
          for(const k in current)
            if(current[k] !== value[k]){
              current[k] = value[k];
              isNew = true;
            }
  
        if(isNew)
          this.update(key, value);
      })
  
      return () => current;
    }
  );
}