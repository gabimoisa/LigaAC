export const urlChartColors = {
    visitedUrls: {
        backgroundColor: 'rgba(21, 79, 186, 0.5)', 
        borderColor: '#154FBA'               
    },
    blockedUrls: {
        backgroundColor: 'rgba(208, 3, 0, 0.5)',  // "deep-red"
        borderColor: '#a94442'                    
    }
  };
  export const borderWidth = 1;
  
  export function numbers({ count, min, max }) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1) + min));
  }
  