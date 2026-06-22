// components/DocumentCard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteDocument } from '../services/documentService';
import { 
  FiFile, 
  FiDownload, 
  FiTrash2, 
  FiFileText, 
  FiImage, 
  FiVideo, 
  FiExternalLink,
  FiEye,
  FiX
} from 'react-icons/fi';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa'; // ✅ Ajout des icônes Fa

const DocumentCard = ({ document, onDelete }) => {
  const { user } = useAuth();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Déterminer le type de fichier
  const getFileType = (url) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop()?.toLowerCase() || '';
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
    const pdfExts = ['pdf'];
    const docExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (pdfExts.includes(ext)) return 'pdf';
    if (docExts.includes(ext)) return 'document';
    return 'unknown';
  };

  const fileType = getFileType(document.file_url);

  // Icône selon le type
  const getFileIcon = () => {
    const ext = document.file_url?.split('.').pop()?.toLowerCase() || '';
    
    switch (ext) {
      case 'pdf': return <FaFilePdf className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx': return <FaFileWord className="w-8 h-8 text-blue-500" />;
      case 'xls':
      case 'xlsx': return <FaFileExcel className="w-8 h-8 text-green-500" />;
      case 'ppt':
      case 'pptx': return <FaFilePowerpoint className="w-8 h-8 text-orange-500" />;
      default:
        switch (fileType) {
          case 'image': return <FiImage className="w-8 h-8 text-blue-500" />;
          case 'video': return <FiVideo className="w-8 h-8 text-purple-500" />;
          case 'pdf': return <FaFilePdf className="w-8 h-8 text-red-500" />;
          default: return <FiFile className="w-8 h-8 text-gray-500" />;
        }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous supprimer ce document ?')) {
      try {
        await deleteDocument(document.id);
        onDelete(document.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du document.');
      }
    }
  };

  // Aperçu du document
  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        return (
          <img 
            src={document.file_url} 
            alt={document.title}
            className="w-full h-auto max-h-96 object-contain rounded-lg"
          />
        );
      case 'pdf':
        return (
          <iframe
            src={`${document.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-[500px] rounded-lg"
            title={document.title}
          />
        );
      case 'video':
        return (
          <video 
            controls 
            className="w-full max-h-96 rounded-lg"
            src={document.file_url}
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        );
      default:
        return (
          <div className="text-center py-12">
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aperçu non disponible</p>
            <a 
              href={document.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Ouvrir dans un nouvel onglet
            </a>
          </div>
        );
    }
  };

  return (
    <>
      <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start gap-4">
          {/* Icône */}
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            {getFileIcon()}
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate" title={document.title}>
              {document.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {document.type || 'Document'}
              </span>
              <span className="text-xs text-gray-400">
                {fileType.toUpperCase()}
              </span>
              {document.created_at && (
                <span className="text-xs text-gray-400">
                  {new Date(document.created_at).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {/* Bouton Aperçu */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-300 text-sm font-medium"
          >
            <FiEye className="w-4 h-4" />
            Aperçu
          </button>

          {/* Bouton Télécharger */}
          <a
            href={document.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors duration-300 text-sm font-medium"
          >
            <FiDownload className="w-4 h-4" />
            Télécharger
          </a>

          {/* Bouton Ouvrir */}
          <a
            href={document.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-300 text-sm font-medium"
          >
            <FiExternalLink className="w-4 h-4" />
            Ouvrir
          </a>

          {/* Bouton Supprimer (admin seulement) */}
          {user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-300 text-sm font-medium ml-auto"
            >
              <FiTrash2 className="w-4 h-4" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* ======== MODAL D'APERÇU ======== */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête du modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 truncate max-w-md">
                  {document.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {document.type || 'Document'} • {fileType.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {renderPreview()}
            </div>

            {/* Pied du modal */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <FiDownload className="w-5 h-5" />
                Télécharger
              </a>
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiExternalLink className="w-5 h-5" />
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentCard;