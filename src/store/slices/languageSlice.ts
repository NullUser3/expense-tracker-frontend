import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Lang = "en" | "ar";

interface NavbarProps {
  lang: Lang;
}

const initialState:NavbarProps = { lang: "en" };

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLang:(state,action:PayloadAction<Lang>)=>{
      state.lang=action.payload
    }
  },
});

export const { setLang } = languageSlice.actions;
export default languageSlice.reducer;