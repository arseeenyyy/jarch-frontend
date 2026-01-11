const customJsonEditorTheme = {
  styles: {
    container: {
      backgroundColor: 'transparent',
      fontFamily: 'var(--font-family-main)',
    },
    property: 'var(--color-label)',
    bracket: { 
      color: 'var(--color-text-accent)', 
      fontWeight: 'bold' 
    },
    itemCount: { 
      color: 'var(--color-text-muted)', 
      fontStyle: 'italic' 
    },
    string: '#a0c8a0',
    number: '#8a8ac8',
    boolean: '#c8a0a0',
    null: { 
      color: '#c8c8a0',
      fontVariant: 'small-caps', 
      fontWeight: 'bold' 
    },
    input: [
      'var(--color-text-primary)', 
      { 
        fontSize: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--color-border)',
        borderRadius: '2px'
      }
    ],
    inputHighlight: 'var(--color-border-focus)',
    error: { 
      fontSize: '0.8em', 
      color: 'var(--color-error)', 
      fontWeight: 'bold' 
    },
    iconCollection: 'var(--color-text-accent)',
    iconEdit: 'var(--color-link)',
    iconDelete: '#c8a0a0',
    iconAdd: 'var(--color-link)',
    iconCopy: '#8a8ac8',
    iconOk: '#a0c8a0',
    iconCancel: '#c8a0a0',
  },
};

export default customJsonEditorTheme;
