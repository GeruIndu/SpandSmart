import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
    username = "",
    type = "budget-alert",
    data = {}
}) {

    if (type === "monthly-report") {

    }
    else if (type === "budget-alert") {
        return (
            < Html >
                <Head />
                <Preview>
                    Budget Alert
                </Preview>

                <Body style={styles.body}>
                    <Container style={styles.container}>
                        <Heading style={styles.title}>Budget Alert</Heading>
                        <Text style={styles.text}>Hello {username},</Text>
                        <Text style={styles.text}>
                            You&rsquo;ve used {data?.percentageUsed?.toFixed(2)}% of your monthly budget.
                        </Text>

                        <Section style={styles.statsContainer}>
                            <div style={styles.stat}>
                                <Text style={styles.text}>Budget Amount</Text>
                                <Text style={styles.heading}>${data?.budgetAmount}</Text>
                            </div>
                            <div style={styles.stat}>
                                <Text style={styles.text}>Spent So Far</Text>
                                <Text style={styles.heading}>${data?.totalExpenses}</Text>
                            </div>
                            <div style={styles.stat}>
                                <Text style={styles.text}>Remaining</Text>
                                <Text style={styles.heading}>${data?.budgetAmount - data?.totalExpenses}</Text>
                            </div>
                        </Section>
                    </Container>
                </Body>
            </Html >
        )
    }

}

const styles = {
    body: {
        backgroundColor: "#f6f9fc",
        fontFamily: '-apple-system, sens-serif'
    },
    container: {
        backgroundColor: '#ffffff',
        margin: '0 auto',
        padding: '20px',
        borderRedius: '5px',
        borderShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    title: {
        color: '#1f2937',
        fontSize: '32px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '0 0 20px'
    },
    heading: {
        color: '#1f2937',
        fontSize: '20px',
        fontWeight: '600',
        margin: '0 0 16px'
    },
    statsContainer: {
        margin: '32px 0',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRedius: '5px'
    },
    stat: {
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#fff',
        borderRedius: '4px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    }
}