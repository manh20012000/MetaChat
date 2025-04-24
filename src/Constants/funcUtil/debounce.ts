// utils/debounce.ts
export const debounce = (func: Function, delay: number) => {
    let timer: any;
    return function (...args: any[]) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  