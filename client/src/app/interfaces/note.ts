export interface Note {
  _id: string,
  _rev: string,
  _deleted : boolean,
  title: string,
  content: string,
  tags: Array<string>,
  type: string
}