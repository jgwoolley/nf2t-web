
/**
 * 
 * @see https://stackoverflow.com/questions/50694881/how-to-download-file-in-react-js
 * 
 * @param file 
 */
export function downloadFile(file: File) {
    const url = window.URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;

    link.target = '_blank'; // Open in a new tab
    link.rel = 'noopener noreferrer'; // Good practice for security when opening new tabs

    // For displayable files, opening in a new tab is often the best iOS experience.
    // Users can then use the iOS Share Sheet to save the file.
    // However, we still include the download attribute as a fallback/hint for other browsers.
    link.setAttribute('download', file.name);

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();


    // Clean up:
    // You might want to delay this if the new tab needs a moment to load,
    // or revoke after a short timeout.
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.parentNode?.removeChild(link);
    }, 100); // A small delay
}