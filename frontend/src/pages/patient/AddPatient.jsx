import { useTranslation } from "react-i18next";

export default function AddPatient() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('addPatient.title', 'Add Patient')}</h1>
      <form>
        <input type="text" placeholder={t('addPatient.search', 'Search')} />
        <button type="submit">{t('addPatient.submit', 'Submit')}</button>
      </form>
    </div>
  );
}