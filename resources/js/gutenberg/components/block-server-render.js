/**
 * WordPress dependencies
 */
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Internal dependencies
 */
import Skeleton from './skeleton';

const LoadingResponsePlaceholder = () => (
	<div style={ { padding: '20px' } }>
		<Skeleton variant="card" count={ 3 } width="100%" />
	</div>
);

export default function BlockServerRender( {
	block,
	attributes = {},
	className = '',
	urlQueryArgs = {},
} ) {
	return (
		<div className={ className } style={ { pointerEvents: 'none' } }>
			<ServerSideRender
				block={ block }
				attributes={ attributes }
				urlQueryArgs={ urlQueryArgs }
				httpMethod="POST"
				LoadingResponsePlaceholder={ LoadingResponsePlaceholder }
			/>
		</div>
	);
}
