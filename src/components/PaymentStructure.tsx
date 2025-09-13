'use client';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../styles/PaymentStructure.module.css';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';

export default function PaymentStructure() {
  const { t } = useTranslation('common');
  const [modalOpen, setModalOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const pathname = usePathname();

  // Determinar si estamos en la ruta /training
  const isTrainingRoute = pathname === '/training';

  const paymentData = [
    { participaciones: 100, pagoTurno: '$50', pagoHora: '$12.5' },
    { participaciones: 150, pagoTurno: '$75', pagoHora: '$18.75' },
    {
      participaciones: '200 (Meta)',
      pagoTurno: '$100',
      pagoHora: '$25',
      highlighted: true,
    },
    { participaciones: 250, pagoTurno: '$125', pagoHora: '$31.25' },
    {
      participaciones: 400,
      pagoTurno: '$200',
      pagoHora: '$50',
      highlighted: true,
    },
  ];

  // Si estamos en /training, mostrar solo el botón rosa
  if (isTrainingRoute) {
    return (
      <>
        <div
          className={styles.trainingPaymentButton}
          onClick={() => setTableModalOpen(true)}
        >
          <div className={styles.trainingButtonIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className={styles.trainingButtonContent}>
            <div className={styles.trainingButtonTitle}>
              ESTRUCTURA DE PAGOS
            </div>
            <div className={styles.trainingButtonSubtitle}>
              VER TABLA DE GANANCIAS
            </div>
          </div>
          <div className={styles.trainingButtonEye}>
            <VisibilityIcon />
          </div>
        </div>

        {/* Modal de tabla para /training */}
        <Dialog
          open={tableModalOpen}
          onClose={() => setTableModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pr: 2,
              background: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
              }}
            >
              <span style={{ flex: 1, textAlign: 'center' }}>
                {t('payment_table_title')}
              </span>
              <IconButton
                aria-label="Info"
                onClick={() => setModalOpen(true)}
                sx={{ color: '#d63384' }}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </div>
            <IconButton
              aria-label="Cerrar"
              onClick={() => setTableModalOpen(false)}
              sx={{ color: '#d63384' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ padding: 0 }}>
            <div className={styles.tableWrapper}>
              <table className={styles.paymentTable}>
                <thead>
                  <tr className={styles.headerRow}>
                    <th className={styles.headerCell}>
                      {t('payment_table_header_participaciones')}
                    </th>
                    <th className={styles.headerCell}>
                      {t('payment_table_header_turno')}
                    </th>
                    <th className={styles.headerCell}>
                      {t('payment_table_header_hora')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentData.map((row, index) => (
                    <tr
                      key={index}
                      className={`${styles.dataRow} ${
                        row.highlighted ? styles.highlighted : ''
                      }`}
                    >
                      <td className={styles.dataCell}>{row.participaciones}</td>
                      <td className={styles.dataCell}>{row.pagoTurno}</td>
                      <td className={styles.dataCell}>{row.pagoHora}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de información (modal sobre modal) */}
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pr: 2,
            }}
          >
            {t('modal_payment_title')}
            <IconButton
              aria-label="Cerrar"
              onClick={() => setModalOpen(false)}
              sx={{ color: '#d63384' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>{t('modal_type')}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t('modal_payment')}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{t('modal_new')}</TableCell>
                    <TableCell>$0.25</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('modal_existing')}</TableCell>
                    <TableCell>$0.10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {t('modal_share_zip')}
                      <br />
                      <small style={{ color: '#777' }}>
                        {t('modal_zip_match')}
                      </small>
                    </TableCell>
                    <TableCell>$0.10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {t('modal_share_nozip')}
                      <br />
                      <small style={{ color: '#777' }}>
                        {t('modal_zip_nomatch')}
                      </small>
                    </TableCell>
                    <TableCell>$0.25</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" mt={2} color="text.secondary">
              <strong>{t('modal_note_title')}:</strong> {t('modal_note_text')}
            </Typography>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Versión original para otras rutas
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{t('payment_title')}</h2>
      <p
        className={styles.subtitle}
        dangerouslySetInnerHTML={{ __html: t('payment_subtitle') }}
      />

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3
            className={styles.tableTitle}
            style={{ textAlign: 'center', width: '100%' }}
          >
            {t('payment_table_title')}
          </h3>

          <IconButton
            aria-label="Info"
            onClick={() => setModalOpen(true)}
            className={styles.infoIcon}
          >
            <InfoOutlinedIcon sx={{ color: '#d63384' }} />
          </IconButton>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.paymentTable}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.headerCell}>
                  {t('payment_table_header_participaciones')}
                </th>
                <th className={styles.headerCell}>
                  {t('payment_table_header_turno')}
                </th>
                <th className={styles.headerCell}>
                  {t('payment_table_header_hora')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentData.map((row, index) => (
                <tr
                  key={index}
                  className={`${styles.dataRow} ${
                    row.highlighted ? styles.highlighted : ''
                  }`}
                >
                  <td className={styles.dataCell}>{row.participaciones}</td>
                  <td className={styles.dataCell}>{row.pagoTurno}</td>
                  <td className={styles.dataCell}>{row.pagoHora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de información */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 2,
          }}
        >
          {t('modal_payment_title')}
          <IconButton
            aria-label="Cerrar"
            onClick={() => setModalOpen(false)}
            sx={{ color: '#d63384' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>{t('modal_type')}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{t('modal_payment')}</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{t('modal_new')}</TableCell>
                  <TableCell>$0.25</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('modal_existing')}</TableCell>
                  <TableCell>$0.10</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    {t('modal_share_zip')}
                    <br />
                    <small style={{ color: '#777' }}>
                      {t('modal_zip_match')}
                    </small>
                  </TableCell>
                  <TableCell>$0.10</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    {t('modal_share_nozip')}
                    <br />
                    <small style={{ color: '#777' }}>
                      {t('modal_zip_nomatch')}
                    </small>
                  </TableCell>
                  <TableCell>$0.25</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" mt={2} color="text.secondary">
            <strong>{t('modal_note_title')}:</strong> {t('modal_note_text')}
          </Typography>
        </DialogContent>
      </Dialog>
    </section>
  );
}
