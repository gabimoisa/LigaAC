export const urlChartColors = {
    visitedUrls: {
        backgroundColor: 'rgba(0, 138, 0, 0.5)',  // "fine-pine"
        borderColor: '#025839'               
    },
    blockedUrls: {
        backgroundColor: 'rgba(153, 2, 0, 0.5)',  // "deep-red"
        borderColor: '#670000'                    
    }
  };
  export const borderWidth = 1;
  
  export function numbers({ count, min, max }) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1) + min));
  }
  