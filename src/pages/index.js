import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment';
import { getDataFromServer, postDatatoServer } from '@/components/services';
import { useRouter } from 'next/router';
import { saveAs } from 'file-saver';
import htmlToDocx from 'html-to-docx';

export default function App() {
  const [pageContent, setPageContent] = useState('');
  const [tableData, setTableData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const router = useRouter();
  const path = router.asPath.replace(/^\/#/, '');
  const [reports, setReports] = useState([]);
  // const urlParams = new URLSearchParams(url.split('?')[1]);
  const User = "Shiv";

  useEffect(() => {
    function handleResponse(responseData) {
      if (responseData.status === 'success') {
        setReports(responseData.response);
      }
    }

    const endpoint = 'templates';
    const params = {
      token: '',
    };
    const props = {};

    getDataFromServer({
      end_point: endpoint,
      params,
      call_back: handleResponse,
      props,
    });
  }, []);

  useEffect(() => {
    function handleResponse(responseData) {
      if (responseData.status === 'success') {
        setTableData(responseData.response[0]);
      } else {
        console.error('Error:', responseData.error);
      }
    }
    const endpoint = 'StudyID';
    const requestBody = {
      StudyInstanceUID: path,
    };

    const props = {
      header: true,
    };

    postDatatoServer({
      end_point: endpoint,
      body: requestBody,
      call_back: handleResponse,
      props,
    });
  }, []);

  const formattedDate = moment(tableData?.Date, 'D/M/YYYY, h:mm:ss a').format('DD-MMMM-YYYY');

  useEffect(() => {
    if (selectedItem) {
      const selectedReport = reports.find((report) => report.templateID === parseInt(selectedItem));

      if (selectedReport) {
        const initialText = `
        ${selectedReport.name} <br/>
        <br/>STUDY_PROTOCOL: ${
          selectedReport.content.STUDY_PROTOCOL ? selectedReport.content.STUDY_PROTOCOL.replace(/\n/g, '<br/>') : ''
        } <br/>
        <br/>
        OBSERVATION:
        ${selectedReport.content.OBSERVATION.replace(/\n/g, '<br/>')}
        <br/> <br/>IMPRESSION:<br/>
        ${selectedReport.content.IMPRESSION.replace(/\n/g, '<br/>')}
      `;
        setPageContent(initialText);
      }
    } else {
      setPageContent('');
    }
  }, [selectedItem, reports]);

  const handleChange = (e) => {
    setSelectedItem(e.target.value);
  };

  const drText1 = `
  Please correlate clinically and with related investigations; it may be more informative.`;
  const drText2 = `This report is based on digital DICOM images provided via the internet without identification of the patient, not on the films / plates provided to the patient.`;
  const drText3 = `
  WISH YOU A SPEEDY RECOVERY`;
  const drText4 = `
  Thanks for Referral`;
  const drText5 = `Disclaimer:-`;

  const drText6 = `It is an online interpretation of medical imaging based on clinical data. All modern machines/procedures have their own limitation. If there is any clinical `;
  const drText7 = ` discrepancy, this investigation may be repeated or reassessed by other tests. Patient's identification in online reporting is not established, so in no way this report can be utilized for any medico legal purpose. In case of any discrepancy due to typing error or machinery error please get it rectified immediately.`;

  const imgDr =
    tableData?.mlc === true
      ? `
    <img
      src="${tableData?.mlcsignUrl}"
      alt="Medical Image"
    />
  `
      : User === 'DrJay'
      ? `
    <img
      src="${tableData?.signUrldr1}"
      alt="Medical Image"
    />
  `
      : `
    <img
      src="${tableData?.signUrl}"
      alt="Default Image"
    />
  `;

  const drDetails =
    tableData?.mlc === true
      ? `${tableData?.mlcdrName?.name}
MD (Radio-Diagnosis)
${tableData?.mlcdrName?.compony}`
      : `${tableData?.drName?.name}
MD (Radio-Diagnosis)
${tableData?.drName?.compony}`;

  const handleDownloadDocx = async () => {
    const fullContent = pageContent || pageContent.level.content;
    const table = ` <table className="text-dark mb-3 min-w-full whitespace-nowrap border text-center text-sm font-light">
    <thead className="border-b font-medium">
      <tr>
        <th
          scope="col"
          className="border-r"
        >
          Patient ID
        </th>
        <th
          scope="col"
          className="border-r"
        >
          Patient Name
        </th>
        <th
          scope="col"
          className="border-r"
        >
          Date
        </th>
        <th
          scope="col"
          className="border-r"
        >
          Study
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b font-medium">
        <td className="border-r">${tableData?.patientID}</td>
        <td className="border-r">${tableData?.name}</td>
        <td className="border-r">${formattedDate}</td>
        <td className="border-r">${tableData?.study}</td>
      </tr>
    </tbody>
    <thead className="border-b font-medium">
      <tr>
        <th
          scope="col"
          className="border-r"
        >
          Gender
        </th>
        <th
          scope="col"
          className="border-r"
        >
          Modality
        </th>
        <th
          scope="col"
          className="border-r"
        >
          Age
        </th>
        <th
          scope="col"
          className="border-r"
        >
          Ref Doctor
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b font-medium">
        <td className="border-r">${tableData?.PatientSex}</td>
        <td className="border-r">${tableData?.modality}</td>
        <td className="border-r">${tableData?.PatientAge}</td>
        <td className="border-r">${tableData?.ReferringPhysicianName}</td>
      </tr>
    </tbody>
  </table>`;
    const docx = await htmlToDocx(
      table + fullContent + drText1 + drText2 + drText3 + drText4 + drText5 + drText6 + drText7 + imgDr + drDetails
    );
    saveAs(docx, 'report.docx');
  };

  return (
    <div className="p-3">
      <table className="min-w-full border text-center text-sm font-light text-dark mb-3">
        <thead className="border-b font-medium">
          <tr>
            <th scope="col" className="border-r">
              Patient ID
            </th>
            <th scope="col" className="border-r">
              Patient Name
            </th>
            <th scope="col" className="border-r">
              Date
            </th>
            <th scope="col" className="border-r">
              Study
            </th>
            {/* <th
              scope="col"
              className="border-r"
            >
              Ref Doctor
            </th> */}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b font-medium">
            <td className="border-r">{tableData?.patientID}</td>
            <td className="border-r">{tableData?.name}</td>
            <td className="border-r">{formattedDate}</td>
            <td className="border-r">{tableData?.study}</td>
            {/* <td className="border-r">{tableData.ReferringPhysicianName}</td> */}
          </tr>
        </tbody>
        <thead className="border-b font-medium">
          <tr>
            <th scope="col" className="border-r">
              Gender
            </th>
            <th scope="col" className="border-r">
              Modality
            </th>
            <th scope="col" className="border-r">
              Age
            </th>
            <th scope="col" className="border-r">
              Ref Doctor
            </th>
            {/* <th
              scope="col"
              className="border-r"
            >
              Ref Doctor
            </th> */}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b font-medium">
            <td className="border-r">{tableData?.PatientSex}</td>
            <td className="border-r">{tableData?.modality}</td>
            <td className="border-r">{tableData?.PatientAge}</td>
            <td className="border-r">{tableData?.ReferringPhysicianName}</td>
            {/* <td className="border-r">{tableData.ReferringPhysicianName}</td> */}
          </tr>
        </tbody>
      </table>
      <div className="mb-3 flex gap-3 items-center">
        <div className="">
          <label for="report" className="text-dark me-2">
            Select Report:
          </label>
          <select
            className="text-gray-900 cursor-pointer bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            id="report"
            value={selectedItem}
            onChange={handleChange}
          >
            <option value="">Select a report</option>
            {reports.map((report, key) => (
              <option key={key} value={report.templateID}>
                {report.Heading}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          onClick={handleDownloadDocx}
        >
          Download DOCX
        </button>
      </div>

      <Editor
        apiKey="pbn0qqswn3is37mobq3zhkjf5squog65la49wi7rtqaoe1nv"
        onChange={(value) => setPageContent(value)}
        initialValue={pageContent}
        init={{
          menubar: false,
          height: 500,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'code',
            'help',
            'wordcount',
          ],
          toolbar:
            'undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist',
        }}
      />
    </div>
  );
}
