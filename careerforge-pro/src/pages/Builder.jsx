import ResumeForm from '../components/Resume/ResumeForm';
import ResumePreview from '../components/Resume/ResumePreview';
import './Builder.css';

export default function Builder() {
  return (
    <div className="builder" id="builder-page">
      <div className="builder__form">
        <ResumeForm />
      </div>
      <div className="builder__preview">
        <ResumePreview />
      </div>
    </div>
  );
}
