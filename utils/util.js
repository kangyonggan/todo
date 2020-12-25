/**
 * 从笔记中删除指定id的元素
 * 
 * @param {*} notes 
 * @param {*} id 
 */
function removeById(notes, id) {
  var index = -1;
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].id === id) {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    notes.splice(index, 1);
  }
  return notes;
}

/**
 * 根据指定id更新元素
 * 
 * @param {*} notes 
 * @param {*} note - id必传 
 */
function updateById(notes, note) {
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].id === note.id) {
      notes[i] = note;
      break;
    }
  }
  return notes;
}

/**
 * 从笔记中获取指定类型的元素
 * 
 * @param {*} notes 
 * @param {*} type 
 */
function getByType(notes, type) {
  var resultList = [];
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].type === type) {
      resultList.push(notes[i]);
    }
  }
  return resultList;
}

/**
 * 从笔记中获取指定id的元素
 * 
 * @param {*} notes 
 * @param {*} id 
 */
function getById(notes, id) {
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].id === id) {
      return notes[i];
    }
  }
}

module.exports = {
  removeById: removeById,
  getById: getById,
  getByType: getByType,
  updateById: updateById
};