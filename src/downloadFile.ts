
/**
 * 
 * @see https://stackoverflow.com/questions/50694881/how-to-download-file-in-react-js
 * 
 * @param blob 
 * @param filename 
 */
export function downloadFile(blob: Blob, filename: string) {
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
          'download',
          filename,
      );

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode?.removeChild(link);
}