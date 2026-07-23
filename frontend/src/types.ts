export interface FileNode {
  type: 'file';
  name: string;
}

export interface DirNode {
  type: 'dir';
  name: string;
  children?: Node[];
}

export type Node = FileNode | DirNode;

export type RepoName = 'ProjectSekai-story' | 'BangDream-story';
