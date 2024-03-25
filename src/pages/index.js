import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment';
import { getDataFromServer, postDatatoServer } from '@/components/services';
import { useRouter } from 'next/router';

export default function App() {
  const [pageContent, setPageContent] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const router = useRouter();
  const path = router.asPath.replace(/^\/#/, '');
  const [reports, setReports] = useState([]);

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
    }
  }, [selectedItem, reports]);

  const handleChange = (e) => {
    setSelectedItem(e.target.value);
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
      <div className="mb-3">
        <label for="report" className="text-dark me-2">
          Select Report:
        </label>
        <select
          className="border cursor-pointer p-1 focus-visible:outline-0"
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
