import { Screen } from "@/components/layout/screen";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export default function OrdersScreen() {
  return (
    <Screen title="Orders" description="Fulfilment and SKU performance">
      <Card>
        <CardContent className="p-4">
          <Text variant="muted">
            Order screens go here — waiting on the UI designs.
          </Text>
        </CardContent>
      </Card>
    </Screen>
  );
}
