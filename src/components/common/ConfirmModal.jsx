import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'delete' }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="absolute inset-0">
                    <defs>
                      <pattern id={`${type}-pattern`} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                        <rect width="100%" height="100%" fill={type === 'delete' ? '#FEE2E2' : '#DBEAFE'} />
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="8" 
                          fill="none" 
                          stroke={type === 'delete' ? '#F87171' : '#60A5FA'} 
                          strokeWidth="1.5" 
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${type}-pattern)`} />
                  </svg>
                </div>

                <div className="relative">
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center ${
                      type === 'delete' ? 'text-red-700' : 'text-blue-700'
                    }`}
                  >
                    <div 
                      className={`w-9 h-9 rounded-full mr-3 flex items-center justify-center ${
                        type === 'delete' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                    </div>
                    {title || (type === 'delete' ? 'Confirm Deletion' : 'Confirm Action')}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{message}</p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      {cancelText || 'Cancel'}
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        type === 'delete'
                          ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                          : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
                      }`}
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                    >
                      {confirmText || (type === 'delete' ? 'Delete' : 'Confirm')}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;
