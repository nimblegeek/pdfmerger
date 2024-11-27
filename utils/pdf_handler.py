import os
from PyPDF2 import PdfMerger

def merge_pdfs(pdf_files):
    """
    Merge multiple PDF files into a single PDF
    
    Args:
        pdf_files (list): List of PDF file paths
    
    Returns:
        str: Path to the merged PDF file
    """
    merger = PdfMerger()
    
    try:
        for pdf in pdf_files:
            merger.append(pdf)
        
        output_path = os.path.join('temp_uploads', 'merged.pdf')
        merger.write(output_path)
        merger.close()
        return output_path
    except Exception as e:
        merger.close()
        raise Exception(f"Error merging PDFs: {str(e)}")
