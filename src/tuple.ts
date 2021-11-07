import Model, { set } from "@expressive/mvc";

export function tuple<T extends any[]>(...value: T): T | undefined {
  return set(
    function tuple(this: Model.Controller, key: string){
      this.manage(key, value, (next: T) => {
        let isNew = false;

        for(const k in value)
          if(value[k] !== next[k]){
            value[k] = next[k];
            isNew = true;
          }

        return isNew;
      })
  
      return () => value;
    }
  );
}