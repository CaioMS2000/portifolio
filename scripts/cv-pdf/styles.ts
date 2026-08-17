import { StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'

const COLORS = {
	text: '#1a1a1a',
	muted: '#5a5a5a',
	accent: '#1d4ed8',
	border: '#dcdcdc',
}

export const styles = StyleSheet.create({
	page: {
		fontFamily: FONT_FAMILY,
		fontSize: 10,
		color: COLORS.text,
		backgroundColor: '#ffffff',
		paddingVertical: 32,
		paddingHorizontal: 40,
	},
	header: {
		marginBottom: 12,
	},
	name: {
		fontSize: 20,
		fontWeight: 700,
	},
	role: {
		fontSize: 11,
		color: COLORS.accent,
		marginTop: 2,
	},
	contactLine: {
		fontSize: 9,
		color: COLORS.muted,
		marginTop: 6,
	},
	contactLink: {
		color: COLORS.accent,
		textDecoration: 'none',
	},
	summary: {
		fontSize: 10,
		lineHeight: 1.4,
		color: COLORS.text,
		marginBottom: 16,
	},
	section: {
		marginBottom: 14,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: 700,
		color: COLORS.accent,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 6,
		paddingBottom: 2,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	projectItem: {
		marginBottom: 8,
	},
	projectName: {
		fontSize: 11,
		fontWeight: 700,
	},
	projectDesc: {
		fontSize: 9.5,
		color: COLORS.text,
		marginTop: 1,
	},
	projectTags: {
		fontSize: 8.5,
		color: COLORS.muted,
		marginTop: 2,
	},
	bullet: {
		fontSize: 9.5,
		lineHeight: 1.35,
		marginTop: 2,
		paddingLeft: 4,
	},
	stackLine: {
		fontSize: 9.5,
		lineHeight: 1.5,
	},
	stackLabel: {
		fontWeight: 700,
	},
	expItem: {
		marginBottom: 8,
	},
	expHeader: {
		fontSize: 10.5,
		fontWeight: 700,
	},
	eduLine: {
		fontSize: 9.5,
		lineHeight: 1.5,
	},
})
