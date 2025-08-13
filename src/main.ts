import { CoreCanvas } from "./diagJS/core/canvas";
import { NodeTemplate } from "./diagJS/core/node";
import Konva from "konva";

// 캔버스 초기화
const canvas = new CoreCanvas("testDiv", {
  width: 1000,
  height: 800,
  maxWidth: 1500,
  maxHeight: 1200,
  useGrid: true,
});

// // 커스텀 노드 템플릿 생성
// const diamondTemplate = new NodeTemplate();
// const diamond = new Konva.RegularPolygon({
//   sides: 4,
//   radius: 50,
//   fill: '#ffeb3b',
//   stroke: '#f57f17',
//   strokeWidth: 2,
//   rotation: 45,
//   name: 'background'
// });

// const diamondText = new Konva.Text({
//   x: -25,
//   y: -8,
//   width: 50,
//   height: 16,
//   text: 'Decision',
//   fontSize: 12,
//   fontFamily: 'Arial',
//   fill: '#333',
//   align: 'center',
//   name: 'text'
// });

// diamondTemplate
//   .addShape('background', diamond)
//   .addShape('text', diamondText)
//   .addPort('input', { x: 0, y: -50 }, { isInput: true })
//   .addPort('yes', { x: 50, y: 0 }, { isOutput: true })
//   .addPort('no', { x: -50, y: 0 }, { isOutput: true });

// // 템플릿 등록
// canvas.setNodeTemplate('diamond', diamondTemplate);

// // 커스텀 링크 템플릿 (직각 연결)
// const orthogonalLinkTemplate = LinkTemplate.createDefaultTemplate()
//   .setRouting(LinkRouting.Orthogonal);

// canvas.setLinkTemplate('orthogonal', orthogonalLinkTemplate);

// // 예제 다이어그램 생성
// function createSampleDiagram() {
//   // 시작 노드 (원형)
//   canvas.addNode({
//     id: "start",
//     text: "시작",
//     color: "#4caf50",
//     category: "circle"
//   }, { x: 200, y: 100 });

//   // 프로세스 노드들 (사각형)
//   canvas.addNode({
//     id: "process1", 
//     text: "데이터 입력",
//     color: "#2196f3"
//   }, { x: 200, y: 200 });

//   canvas.addNode({
//     id: "process2",
//     text: "데이터 검증", 
//     color: "#2196f3"
//   }, { x: 200, y: 300 });

//   // 결정 노드 (다이아몬드)
//   canvas.addNode({
//     id: "decision",
//     text: "유효한가?",
//     color: "#ffeb3b",
//     category: "diamond"
//   }, { x: 200, y: 450 });

//   // 처리 노드들
//   canvas.addNode({
//     id: "process3",
//     text: "데이터 저장",
//     color: "#2196f3"
//   }, { x: 400, y: 450 });

//   canvas.addNode({
//     id: "error",
//     text: "오류 처리",
//     color: "#f44336"
//   }, { x: 50, y: 450 });

//   // 종료 노드
//   canvas.addNode({
//     id: "end",
//     text: "종료",
//     color: "#4caf50",
//     category: "circle"
//   }, { x: 400, y: 600 });

//   // 링크 생성
//   canvas.addLink({
//     from: "start",
//     to: "process1",
//     color: "#666"
//   });

//   canvas.addLink({
//     from: "process1", 
//     to: "process2",
//     color: "#666"
//   });

//   canvas.addLink({
//     from: "process2",
//     to: "decision",
//     color: "#666"
//   });

//   canvas.addLink({
//     from: "decision",
//     to: "process3",
//     fromPort: "yes",
//     toPort: "input",
//     color: "#4caf50",
//     category: "orthogonal"
//   });

//   canvas.addLink({
//     from: "decision",
//     to: "error", 
//     fromPort: "no",
//     toPort: "input",
//     color: "#f44336",
//     category: "orthogonal"
//   });

//   canvas.addLink({
//     from: "process3",
//     to: "end",
//     color: "#666"
//   });

//   canvas.addLink({
//     from: "error",
//     to: "process1",
//     color: "#ff9800",
//     category: "orthogonal"
//   });

//   console.log('Sample diagram created!');
// }

// // UI 컨트롤 생성
// function createControls() {
//   const controlPanel = document.createElement('div');
//   controlPanel.style.position = 'fixed';
//   controlPanel.style.top = '10px';
//   controlPanel.style.right = '10px';
//   controlPanel.style.background = 'white';
//   controlPanel.style.padding = '15px';
//   controlPanel.style.border = '1px solid #ccc';
//   controlPanel.style.borderRadius = '5px';
//   controlPanel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
//   controlPanel.style.zIndex = '1000';

//   // 노드 추가 버튼
//   const addNodeBtn = document.createElement('button');
//   addNodeBtn.textContent = '노드 추가';
//   addNodeBtn.style.margin = '5px';
//   addNodeBtn.style.padding = '8px 12px';
//   addNodeBtn.onclick = () => {
//     const randomId = Math.random().toString(36).substr(2, 9);
//     canvas.addNode({
//       id: randomId,
//       text: `노드 ${randomId}`,
//       color: '#e91e63'
//     }, { 
//       x: Math.random() * 400 + 100, 
//       y: Math.random() * 400 + 100 
//     });
//   };

//   // 줌 피트 버튼
//   const zoomFitBtn = document.createElement('button');
//   zoomFitBtn.textContent = '전체 보기';
//   zoomFitBtn.style.margin = '5px';
//   zoomFitBtn.style.padding = '8px 12px';
//   zoomFitBtn.onclick = () => canvas.zoomToFit();

//   // 클리어 버튼
//   const clearBtn = document.createElement('button');
//   clearBtn.textContent = '모두 지우기';
//   clearBtn.style.margin = '5px';
//   clearBtn.style.padding = '8px 12px';
//   clearBtn.onclick = () => canvas.clearAll();

//   // Undo 버튼
//   const undoBtn = document.createElement('button');
//   undoBtn.textContent = '실행 취소';
//   undoBtn.style.margin = '5px';
//   undoBtn.style.padding = '8px 12px';
//   undoBtn.onclick = () => {
//     console.log('Undo clicked - canUndo:', canvas.undoManager.canUndo());
//     console.log('History length:', canvas.undoManager.history.length);
//     console.log('History index:', canvas.undoManager.historyIndex);
//     canvas.undoManager.undo();
//   };

//   // Redo 버튼  
//   const redoBtn = document.createElement('button');
//   redoBtn.textContent = '다시 실행';
//   redoBtn.style.margin = '5px';
//   redoBtn.style.padding = '8px 12px';
//   redoBtn.onclick = () => {
//     console.log('Redo clicked - canRedo:', canvas.undoManager.canRedo());
//     console.log('History length:', canvas.undoManager.history.length);
//     console.log('History index:', canvas.undoManager.historyIndex);
//     canvas.undoManager.redo();
//   };

//   // JSON Export 버튼
//   const exportBtn = document.createElement('button');
//   exportBtn.textContent = 'JSON 내보내기';
//   exportBtn.style.margin = '5px';
//   exportBtn.style.padding = '8px 12px';
//   exportBtn.onclick = () => {
//     const json = canvas.exportToJson();
//     console.log('Exported JSON:', json);
    
//     // 다운로드 링크 생성
//     const blob = new Blob([json], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'diagram.json';
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   controlPanel.appendChild(addNodeBtn);
//   controlPanel.appendChild(document.createElement('br'));
//   controlPanel.appendChild(zoomFitBtn);
//   controlPanel.appendChild(document.createElement('br'));
//   controlPanel.appendChild(clearBtn);
//   controlPanel.appendChild(document.createElement('br'));
//   controlPanel.appendChild(undoBtn);
//   controlPanel.appendChild(redoBtn);
//   controlPanel.appendChild(document.createElement('br'));
//   controlPanel.appendChild(exportBtn);

//   document.body.appendChild(controlPanel);
// }

// // 예제 실행
// createSampleDiagram();
// createControls();

// // 전역 객체로 노출 (디버깅용)
// (window as any).canvas = canvas;
// (window as any).createSampleDiagram = createSampleDiagram;

// console.log('DiagJS 다이어그램 라이브러리 데모');
// console.log('사용 가능한 기능:');
// console.log('- 노드 드래그: 노드를 클릭하고 드래그');
// console.log('- 노드 편집: 노드를 더블클릭');
// console.log('- 포트 연결: 노드에 마우스를 올리면 포트가 표시됨');
// console.log('- 선택: 클릭하여 선택, Ctrl+클릭으로 다중 선택');
// console.log('- 컨트롤 패널: 우상단의 버튼들 사용');
// console.log('');
// console.log('전역 변수:');
// console.log('- window.canvas: CoreCanvas 인스턴스');
// console.log('- window.createSampleDiagram(): 예제 다이어그램 재생성');