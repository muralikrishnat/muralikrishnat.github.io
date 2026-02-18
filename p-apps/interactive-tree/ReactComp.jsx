import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit2, 
  GripVertical, 
  FolderTree, 
  CornerDownRight, 
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Indent,
  Outdent
} from 'lucide-react';

// --- Utility Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);

// Deep clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// Find a node and its path
const findNodeAndParent = (nodes, id, parent = null) => {
  for (let node of nodes) {
    if (node.id === id) return { node, parent };
    if (node.children) {
      const found = findNodeAndParent(node.children, id, node);
      if (found) return found;
    }
  }
  return null;
};

// --- Initial Data ---

const INITIAL_DATA = [
  {
    id: '1',
    label: 'Marketing Campaign',
    isExpanded: true,
    children: [
      { id: '1-1', label: 'Q1 Strategy', children: [], isExpanded: false },
      { 
        id: '1-2', 
        label: 'Social Media', 
        isExpanded: true, 
        children: [
          { id: '1-2-1', label: 'Instagram Assets', children: [], isExpanded: false },
          { id: '1-2-2', label: 'Twitter Thread', children: [], isExpanded: false }
        ] 
      },
    ]
  },
  {
    id: '2',
    label: 'Product Development',
    isExpanded: true,
    children: [
      { id: '2-1', label: 'MVP Features', children: [], isExpanded: false },
      { id: '2-2', label: 'User Research', children: [], isExpanded: false }
    ]
  }
];

// --- Components ---

const Button = ({ onClick, children, className, title, disabled }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick && onClick(e);
    }}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-all duration-200 flex items-center justify-center
      ${disabled 
        ? 'opacity-30 cursor-not-allowed text-slate-400' 
        : 'hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 active:scale-95'
      } ${className}`}
  >
    {children}
  </button>
);

const TreeNode = ({ 
  node, 
  depth = 0, 
  onToggle, 
  onAdd, 
  onDelete, 
  onUpdateLabel, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  dragOverNodeId, 
  dropPosition,
  onMoveUp,
  onMoveDown,
  onIndent,
  onOutdent
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.label);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdateLabel(node.id, editValue);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(node.label);
      setIsEditing(false);
    }
  };

  // Drag Styles
  const isDragTarget = dragOverNodeId === node.id;
  
  let dragStyleClass = '';
  if (isDragTarget) {
    if (dropPosition === 'top') dragStyleClass = 'border-t-2 border-indigo-500';
    if (dropPosition === 'bottom') dragStyleClass = 'border-b-2 border-indigo-500';
    if (dropPosition === 'inside') dragStyleClass = 'bg-indigo-50 ring-2 ring-indigo-500 ring-inset';
  }

  return (
    <div className="select-none">
      {/* Node Row */}
      <div 
        draggable={!isEditing}
        onDragStart={(e) => onDragStart(e, node)}
        onDragOver={(e) => onDragOver(e, node)}
        onDragEnd={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onDrop={(e) => onDrop(e, node)}
        className={`
          group relative flex items-center py-2 px-2 my-0.5 rounded-lg transition-colors duration-200
          ${isEditing ? 'bg-white shadow-sm ring-2 ring-indigo-400' : 'hover:bg-white hover:shadow-sm'}
          ${dragStyleClass}
        `}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* Connecting Line (Visual Guide) */}
        {depth > 0 && (
          <div className="absolute left-[-13px] top-1/2 w-3 h-px bg-slate-300 -translate-y-1/2" />
        )}

        {/* Drag Handle */}
        <div className="mr-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1">
          <GripVertical size={14} />
        </div>

        {/* Expand/Collapse Toggle */}
        <div 
          onClick={() => onToggle(node.id)}
          className="mr-1 w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-md transition-colors"
        >
          {node.children && node.children.length > 0 ? (
            node.isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />
          ) : (
            <div className="w-4" /> // Spacer
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center">
          {isEditing ? (
            <div className="flex items-center w-full gap-2">
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="flex-1 px-2 py-1 text-sm border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button onClick={handleSave} className="text-green-600 hover:bg-green-50"><Check size={14} /></Button>
              <Button onClick={() => setIsEditing(false)} className="text-red-600 hover:bg-red-50"><X size={14} /></Button>
            </div>
          ) : (
            <span 
              onDoubleClick={() => setIsEditing(true)}
              className="text-sm font-medium text-slate-700 cursor-text flex-1 truncate"
            >
              {node.label}
              <span className="ml-2 text-xs text-slate-400 font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                {node.children?.length || 0} items
              </span>
            </span>
          )}
        </div>

        {/* Action Toolbar (Visible on Hover) */}
        <div className={`
          flex items-center gap-0.5 transition-opacity duration-200
          ${isEditing ? 'hidden' : 'opacity-0 group-hover:opacity-100'}
        `}>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          
          <Button onClick={() => onMoveUp(node.id)} title="Move Up"><ArrowUp size={14} /></Button>
          <Button onClick={() => onMoveDown(node.id)} title="Move Down"><ArrowDown size={14} /></Button>
          <Button onClick={() => onOutdent(node.id)} title="Outdent (Move Left)" disabled={depth === 0}><Outdent size={14} /></Button>
          <Button onClick={() => onIndent(node.id)} title="Indent (Make Child)"><Indent size={14} /></Button>
          
          <div className="h-4 w-px bg-slate-200 mx-1"></div>

          <Button onClick={() => setIsEditing(true)} title="Rename"><Edit2 size={14} /></Button>
          <Button onClick={() => onAdd(node.id)} title="Add Child"><Plus size={14} /></Button>
          <Button onClick={() => onDelete(node.id)} className="hover:text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={14} /></Button>
        </div>
      </div>

      {/* Children Recursion */}
      {node.isExpanded && node.children && node.children.length > 0 && (
        <div className="relative">
           {/* Vertical Line for children */}
          <div 
            className="absolute bg-slate-200 w-px bottom-3 top-0"
            style={{ left: `${(depth * 24) + 27}px` }} 
          />
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
              onAdd={onAdd}
              onDelete={onDelete}
              onUpdateLabel={onUpdateLabel}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dragOverNodeId={dragOverNodeId}
              dropPosition={dropPosition}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onIndent={onIndent}
              onOutdent={onOutdent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [data, setData] = useState(INITIAL_DATA);
  
  // Drag State
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOverNodeId, setDragOverNodeId] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'top', 'bottom', 'inside'

  // --- Actions ---

  const handleToggle = (id) => {
    const newData = clone(data);
    const { node } = findNodeAndParent(newData, id);
    if (node) {
      node.isExpanded = !node.isExpanded;
      setData(newData);
    }
  };

  const handleAddNode = (parentId = null) => {
    const newNode = {
      id: generateId(),
      label: 'New Item',
      children: [],
      isExpanded: true
    };

    const newData = clone(data);

    if (parentId === null) {
      newData.push(newNode);
    } else {
      const { node } = findNodeAndParent(newData, parentId);
      if (node) {
        node.children.push(newNode);
        node.isExpanded = true;
      }
    }
    setData(newData);
  };

  const handleDelete = (id) => {
    const newData = clone(data);
    const { node, parent } = findNodeAndParent(newData, id);
    
    if (parent) {
      parent.children = parent.children.filter(c => c.id !== id);
    } else {
      // It's a root node
      const rootIndex = newData.findIndex(n => n.id === id);
      if (rootIndex > -1) newData.splice(rootIndex, 1);
    }
    setData(newData);
  };

  const handleUpdateLabel = (id, newLabel) => {
    const newData = clone(data);
    const { node } = findNodeAndParent(newData, id);
    if (node) {
      node.label = newLabel;
      setData(newData);
    }
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e, node) => {
    e.stopPropagation();
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default
  };

  const handleDragOver = (e, targetNode) => {
    e.preventDefault();
    if (!draggedNode || draggedNode.id === targetNode.id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Determine position: Top 25%, Bottom 25%, or Middle (Inside)
    if (y < height * 0.25) {
      setDropPosition('top');
    } else if (y > height * 0.75) {
      setDropPosition('bottom');
    } else {
      setDropPosition('inside');
    }

    setDragOverNodeId(targetNode.id);
  };

  const handleDrop = (e, targetNode) => {
    e.preventDefault();
    if (!draggedNode || !dragOverNodeId) return;

    // Prevent dropping into itself or its children
    const isDroppingIntoSelf = (targetId, sourceNode) => {
      if (sourceNode.id === targetId) return true;
      if (sourceNode.children) {
        return sourceNode.children.some(c => isDroppingIntoSelf(targetId, c));
      }
      return false;
    };

    if (isDroppingIntoSelf(targetNode.id, draggedNode)) {
      setDragOverNodeId(null);
      setDropPosition(null);
      setDraggedNode(null);
      return;
    }

    const newData = clone(data);
    
    // 1. Remove dragged node from old location
    const { node: originalNode, parent: originalParent } = findNodeAndParent(newData, draggedNode.id);
    if (!originalNode) return; // Error safety

    if (originalParent) {
      originalParent.children = originalParent.children.filter(n => n.id !== draggedNode.id);
    } else {
      const idx = newData.findIndex(n => n.id === draggedNode.id);
      if (idx > -1) newData.splice(idx, 1);
    }

    // 2. Insert into new location based on dropPosition
    const { node: target, parent: targetParent } = findNodeAndParent(newData, targetNode.id);

    if (dropPosition === 'inside') {
      target.children.push(originalNode);
      target.isExpanded = true;
    } else {
      // Reordering (Sibling)
      const list = targetParent ? targetParent.children : newData;
      const targetIndex = list.findIndex(n => n.id === targetNode.id);
      
      if (dropPosition === 'top') {
        list.splice(targetIndex, 0, originalNode);
      } else {
        list.splice(targetIndex + 1, 0, originalNode);
      }
    }

    setData(newData);
    setDragOverNodeId(null);
    setDropPosition(null);
    setDraggedNode(null);
  };

  // --- Structural Movement Logic (Buttons) ---

  const handleMoveUp = (id) => {
    const newData = clone(data);
    const { parent } = findNodeAndParent(newData, id);
    const list = parent ? parent.children : newData;
    const idx = list.findIndex(n => n.id === id);

    if (idx > 0) {
      const [item] = list.splice(idx, 1);
      list.splice(idx - 1, 0, item);
      setData(newData);
    }
  };

  const handleMoveDown = (id) => {
    const newData = clone(data);
    const { parent } = findNodeAndParent(newData, id);
    const list = parent ? parent.children : newData;
    const idx = list.findIndex(n => n.id === id);

    if (idx < list.length - 1) {
      const [item] = list.splice(idx, 1);
      list.splice(idx + 1, 0, item);
      setData(newData);
    }
  };

  const handleIndent = (id) => {
    const newData = clone(data);
    const { node, parent } = findNodeAndParent(newData, id);
    const list = parent ? parent.children : newData;
    const idx = list.findIndex(n => n.id === id);

    // Can only indent if there is a sibling above to become the parent
    if (idx > 0) {
      const newParent = list[idx - 1];
      const [item] = list.splice(idx, 1);
      newParent.children.push(item);
      newParent.isExpanded = true;
      setData(newData);
    }
  };

  const handleOutdent = (id) => {
    const newData = clone(data);
    const { node, parent } = findNodeAndParent(newData, id);
    
    // Can only outdent if not at root level
    if (parent) {
      const grandparent = findNodeAndParent(newData, parent.id).parent;
      const targetList = grandparent ? grandparent.children : newData;
      
      // Remove from current parent
      parent.children = parent.children.filter(n => n.id !== id);
      
      // Insert after the current parent in the upper list
      const parentIdx = targetList.findIndex(n => n.id === parent.id);
      targetList.splice(parentIdx + 1, 0, node);
      
      setData(newData);
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans text-slate-800 flex justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
                <FolderTree size={28} />
              </div>
              Structure Editor
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-lg">
              Organize your hierarchy. Drag and drop items to reorder or nest them. 
              Double-click text to edit labels.
            </p>
          </div>
          <button 
            onClick={() => handleAddNode(null)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium shadow-md shadow-indigo-200 transition-transform active:scale-95"
          >
            <Plus size={18} />
            New Root Node
          </button>
        </div>

        {/* Tree Container */}
        <div className="bg-white rounded-xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          {/* Legend / Help Text */}
          <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-3 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><GripVertical size={12}/> Drag to move</span>
              <span className="flex items-center gap-1"><Edit2 size={12}/> Double-click to rename</span>
            </div>
            <div className="hidden sm:block">
              {data.reduce((acc, curr) => acc + 1 + (curr.children?.length || 0), 0) } Nodes Total
            </div>
          </div>

          {/* Tree Area */}
          <div 
            className="p-6 min-h-[400px]"
            onDragOver={(e) => {
              e.preventDefault();
              // Clears drag highlights if dragging over empty space
              if(dragOverNodeId && e.target === e.currentTarget) {
                 setDragOverNodeId(null);
                 setDropPosition(null);
              }
            }}
          >
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <CornerDownRight size={48} className="mb-4 opacity-20" />
                <p>Tree is empty</p>
                <button 
                  onClick={() => handleAddNode(null)}
                  className="mt-4 text-indigo-600 font-medium hover:underline"
                >
                  Create first node
                </button>
              </div>
            ) : (
              data.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  onToggle={handleToggle}
                  onAdd={handleAddNode}
                  onDelete={handleDelete}
                  onUpdateLabel={handleUpdateLabel}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  dragOverNodeId={dragOverNodeId}
                  dropPosition={dropPosition}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onIndent={handleIndent}
                  onOutdent={handleOutdent}
                />
              ))
            )}
          </div>
        </div>
        
        <div className="text-center mt-8 text-slate-400 text-xs">
          Built with React & Tailwind CSS
        </div>
      </div>
    </div>
  );
};

export default App;