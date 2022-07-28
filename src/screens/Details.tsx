import { HStack, Text, VStack, useTheme, ScrollView } from 'native-base';
import { useRoute } from '@react-navigation/native';
import { Header } from '../components/Header';
import firestore from "@react-native-firebase/firestore"
import { OrderProps } from '../components/Order';
import { CircleWavyCheck, Hourglass, DesktopTower, Clipboard } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { OrderFirestoreDTO } from '../DTOs/OrderFirestoreDTO';
import { dateFormat } from '../utils/firestoreDateFormat';
import { Loading } from '../components/Loading';
import { CardDetails } from '../components/CardDetails';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from 'react-native';

type RouteParams = {
  orderId: string
}

type OrderDetails = OrderProps & {
  description: string,
  solution: string,
  closed: string
}

export function Details() {
  const [isLoading, setIsLoading] = useState(true)
  const [solution, setSolution] = useState("")
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails)

  const { colors } = useTheme()

  const route = useRoute()
  const { orderId } = route.params as RouteParams

  function handleOrderClose() {
    if(!solution) {
      return Alert.alert("Solução faltando" ,"Informe a solução para encerrar a solicitação")
    }
  }

  useEffect(() => {
    firestore()
    .collection<OrderFirestoreDTO>("orders")
    .doc(orderId)
    .get()
    .then((doc) => {
      const { patrimony, description, status, created_at, closed_at, solution} = doc.data()

      const closed = closed_at ? dateFormat(closed_at) : null

      setOrder({
        id: doc.id,
        patrimony,
        description,
        status,
        solution,
        when: dateFormat(created_at),
        closed
      })

      setIsLoading(false)
    })
  },[])

  if(isLoading) {
    return <Loading />
  }
  
  return (
    <VStack flex={1} bg="gray.700">
      <Header title='Solicitação' p={6}/>
      <HStack bg="gray.500" justifyContent="center" p={4}>
        {
          order.status === "closed"
            ? <CircleWavyCheck size={22} color={ colors.green[300]} />
            : <Hourglass size={22} color={ colors.secondary[700]} />
        }

        <Text
          fontSize="sm"
          color={order.status === "closed" ? colors.green[300] : colors.secondary[700]}
          ml={2}
          textTransform="uppercase"
        >
          {
            order.status === "closed"
              ? "finalizado" : "em andamento"
          }
        </Text>
      </HStack>

      <ScrollView mx={5} showsVerticalScrollIndicator={false}>
        <CardDetails
          title="equipamento"
          description={`Patrimônio ${order.patrimony}`}
          icon={DesktopTower}
          footer={`Registrado ${order.when}`}
        />
        <CardDetails
          title="descrição do problema"
          description={order.description}
          icon={Clipboard}
        />
        <CardDetails
          title="solução"
          icon={CircleWavyCheck}
          footer={order.closed && `Encerrado em ${order.closed}`}
        >
          <Input
            placeholder='Descrição da solução'
            onChangeText={setSolution}
            h={24}
            textAlignVertical="top"
            multiline
          />
        </CardDetails>
      </ScrollView>

      {
        order.status === "open" &&
        <Button title='Encerrar solicitação' m={5}/>
      }
    </VStack>
  );
}