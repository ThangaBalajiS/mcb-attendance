'use client';
import {createContext,useContext} from 'react';
import {useStore} from './useStore';

const StoreCtx=createContext(null);

export function StoreProvider({children}){
 const store=useStore();
 return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}

export const useStoreContext=()=>useContext(StoreCtx);
