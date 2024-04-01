import React from 'react';

const ViewReport = (props) => {
  const { viewData, pageContent, closeModal, tableReport } = props;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="overflow-y-auto rounded bg-white p-4 h-4/5 w-3/4">
          {tableReport()}
          <div
          className='pb-2'
            dangerouslySetInnerHTML={{
              __html:
                (pageContent && pageContent.level && pageContent.level.content !== undefined
                  ? pageContent.level.content
                  : pageContent || 'No preview available') + viewData,
            }}
          ></div>

          <div className="border-t border-gray-300 flex justify-end items-center px-4 pt-2">
            <button type="button" className="h-8 px-2 text-sm rounded-md bg-gray-700 text-white" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewReport;
