// @flow

export const GUI_SET = 'GUI_SET';

export const guiActions = {
  set: (gui) => {
    return {
      type: GUI_SET,
      payload: gui
    }
  }
}
