//official colors

export const fileChartColors = {
    cleanFiles: {
        backgroundColor: 'rgba(21, 79, 186, 0.5)', 
        borderColor: '#154FBA'
    },
    infectedFiles: {
        backgroundColor: 'rgba(208, 3, 0, 0.5)',
        borderColor: '#a94442'
    },
    unknownFiles: {
        backgroundColor: 'rgba(27, 39, 60, 0.5)', 
        borderColor: '#1B273C'
    }
  };

export const barThickness = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 400) {
        return 13;
    } else if (screenWidth < 800) {
        return 20;
    } else {
        return 30;
    }
};
  export const borderWidth = 1;
  