import {useEffect} from 'react'
import Modal from 'react-native-modal'
export default ({children,...modalProps})=>{
    return <Modal isVisible={true} {...modalProps}>
        {children}
    </Modal>
}
