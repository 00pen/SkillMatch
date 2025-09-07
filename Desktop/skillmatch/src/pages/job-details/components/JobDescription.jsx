import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const JobDescription = ({ job }) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Job Description', icon: 'FileText' },
    { id: 'requirements', label: 'Requirements', icon: 'CheckCircle' },
    { id: 'company', label: 'About Company', icon: 'Building2' }
  ];

  const renderSkillBadge = (skill, type = 'required') => (
    <span
      key={skill}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        type === 'required' ?'bg-secondary text-secondary-foreground' :'bg-muted text-text-secondary'
      }`}
    >
      {skill}
    </span>
  );

  const renderDescription = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Job Overview</h3>
        <div className="prose prose-gray max-w-none">
          <p className="text-text-secondary leading-relaxed whitespace-pre-line">
            {job?.description}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Key Responsibilities</h3>
        <ul className="space-y-2">
          {job?.responsibilities && Array.isArray(job.responsibilities) ? job.responsibilities.map((responsibility, index) => (
            <li key={index} className="flex items-start gap-3">
              <Icon name="ChevronRight" size={16} className="text-secondary mt-1 flex-shrink-0" />
              <span className="text-text-secondary">{responsibility}</span>
            </li>
          )) : (
            <li className="text-text-secondary">No specific responsibilities listed</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">What We Offer</h3>
        <ul className="space-y-2">
          {job?.benefits && Array.isArray(job.benefits) ? job.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <Icon name="Check" size={16} className="text-success mt-1 flex-shrink-0" />
              <span className="text-text-secondary">{benefit}</span>
            </li>
          )) : (
            <li className="text-text-secondary">No specific benefits listed</li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Required Qualifications</h3>
        <ul className="space-y-2">
          {job?.requirements && Array.isArray(job.requirements) ? job.requirements.map((requirement, index) => (
            <li key={index} className="flex items-start gap-3">
              <Icon name="CheckCircle" size={16} className="text-secondary mt-1 flex-shrink-0" />
              <span className="text-text-secondary">{requirement}</span>
            </li>
          )) : (
            <li className="text-text-secondary">No specific requirements listed</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {job?.requiredSkills && Array.isArray(job.requiredSkills) ? job.requiredSkills.map(skill => renderSkillBadge(skill, 'required')) : (
            <span className="text-text-secondary">No specific skills listed</span>
          )}
        </div>
      </div>

      {job?.preferredSkills && Array.isArray(job.preferredSkills) && job.preferredSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">Preferred Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.preferredSkills.map(skill => renderSkillBadge(skill, 'preferred'))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <Icon name="GraduationCap" size={20} className="text-secondary" />
          <div>
            <div className="font-medium text-text-primary">Education</div>
            <div className="text-sm text-text-secondary">{job?.education}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Icon name="Clock" size={20} className="text-secondary" />
          <div>
            <div className="font-medium text-text-primary">Experience</div>
            <div className="text-sm text-text-secondary">{job?.experience}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">About {job?.company?.name}</h3>
        <p className="text-text-secondary leading-relaxed whitespace-pre-line">
          {job?.company?.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Icon name="Building2" size={20} className="text-secondary" />
            <div>
              <div className="font-medium text-text-primary">Industry</div>
              <div className="text-sm text-text-secondary">{job?.company?.industry}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="Users" size={20} className="text-secondary" />
            <div>
              <div className="font-medium text-text-primary">Company Size</div>
              <div className="text-sm text-text-secondary">{job?.company?.size}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Icon name="Calendar" size={20} className="text-secondary" />
            <div>
              <div className="font-medium text-text-primary">Founded</div>
              <div className="text-sm text-text-secondary">{job?.company?.founded}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="MapPin" size={20} className="text-secondary" />
            <div>
              <div className="font-medium text-text-primary">Headquarters</div>
              <div className="text-sm text-text-secondary">{job?.company?.headquarters}</div>
            </div>
          </div>
        </div>
      </div>

      {job?.company?.website && (
        <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
          <Icon name="Globe" size={20} className="text-secondary" />
          <div>
            <div className="font-medium text-text-primary">Website</div>
            <a 
              href={job?.company?.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-secondary hover:underline"
            >
              {job?.company?.website}
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return renderDescription();
      case 'requirements':
        return renderRequirements();
      case 'company':
        return renderCompanyInfo();
      default:
        return renderDescription();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6" aria-label="Job details tabs">
          {tabs && Array.isArray(tabs) ? tabs.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${
                activeTab === tab?.id
                  ? 'border-secondary text-secondary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              {tab?.label}
            </button>
          )) : null}
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default JobDescription;